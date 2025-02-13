import * as admin from 'firebase-admin'
import { HouseCompetition } from '../models/HouseCompetition'
import { APIResponse } from '../models/APIResponse'
import { getUser } from './GetUser'
import { UserPermissionLevel } from '../models/UserPermissionLevel'
import { submitPointLogMessage } from './SubmitPointLogMessage'
import { PointLogMessage } from '../models/PointLogMessage'
import { addPoints } from './AddPoints'
import { PointLog } from '../models/PointLog'
import { getSystemPreferences } from './GetSystemPreferences'
import { PointType } from '../models/PointType'

const REJECTED_STRING = "DENIED: "

/**
 * 
 * @param approver_id   ID of user updating the point
 * @param document_id   ID of PointLog to approve/reject
 * @param approve       Boolean to approve/reject the PointLog   
 * @param rejectionMessage String message to post or rejection cause
 * 
 * @throws 403 - InvalidPermissionLevel
 * @throws 412 - House Competition Disabled
 * @throws 413 - UnknownPointLog
 * @throws 416 - PointLogAlreadyHandled
 * @throws 500 - Server Error
 */
export async function updatePointLogStatus(approve: boolean, approver_id: string, document_id: string, rejectionMessage?:string): Promise<boolean> {
    
    const system_preferences = await getSystemPreferences()
    if (!system_preferences.isCompetitionEnabled) {
        return Promise.reject(APIResponse.CompetitionDisabled())
    }

    const user = await getUser(approver_id)
    if (user.permissionLevel !== UserPermissionLevel.RHP) {
        return Promise.reject(APIResponse.InvalidPermissionLevel())
    }
    const db = admin.firestore()
    try {
        const doc_ref = db.collection(HouseCompetition.HOUSE_KEY).doc(user.house.toString())
        .collection(HouseCompetition.HOUSE_COLLECTION_POINTS_KEY).doc(document_id)
        const doc = await doc_ref.get()
        if (!doc.exists) {
            // PointLog could not be found
            return Promise.reject(APIResponse.UnknownPointLog())
        } else {

            const log = PointLog.fromDocumentSnapshot(doc)
            const resident_id = (await getUser(log.residentId)).id

            let already_handled = true
            if (log.pointTypeId < 0) {
                // Log hasn't been handled before.
                already_handled = false
                log.pointTypeId *= -1
            }
            const point_type_doc = await db.collection(HouseCompetition.POINT_TYPES_KEY)
                                    .doc(log.pointTypeId.toString()).get()
            const pointType = PointType.fromDocumentSnapshot(point_type_doc)


            // If reject check to know if need to subtract points
            if (!approve) {
                if (log.description.includes(REJECTED_STRING)) {
                    const response = APIResponse.PointLogAlreadyHandled()
                    return Promise.reject(response)
                } else {
                    log.description = REJECTED_STRING + log.description
                    log.approveLog(user)
                    await doc_ref.set(log.toFirebaseJSON())
                    if (already_handled) {
                        // Log has previously been approved so it is safe to subtract points
                        await addPoints(pointType, user.house, resident_id, false)
                    }
                    const messageObj = PointLogMessage.getRejectionMessage(user, rejectionMessage!)
                    await submitPointLogMessage(user.house, log, messageObj, true)
                }
            } else {
                if (log.description.includes(REJECTED_STRING) || !already_handled) {
                    // Either log was previously rejected and points must be added back
                    // or log has never been added and points need to be added
                    if (log.description.includes(REJECTED_STRING)) {
                        log.description = log.description.slice(REJECTED_STRING.length)                    
                    }
                    log.approveLog(user)
                    await doc_ref.set(log.toFirebaseJSON())
                    await addPoints(pointType, user.house, resident_id)
                    const messageObj = PointLogMessage.getApprovalMessage(user)
                    await submitPointLogMessage(user.house, log, messageObj, true)
                } else {
                    // Log has already been approved so points should not be added
                    const response = APIResponse.PointLogAlreadyHandled()
                    return Promise.reject(response)
                }
            }
            return Promise.resolve(true)
        }
    }
    catch (error) {
        if (error instanceof APIResponse) {
            return Promise.reject(error)
        } else {
            console.error(error)
            const apiError = APIResponse.ServerError()
            return Promise.reject(apiError)
        }
    }
}
