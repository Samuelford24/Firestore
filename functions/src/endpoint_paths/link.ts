import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import { APIResponse } from '../models/APIResponse'
import { getUser } from '../src/GetUser'
import { createLink } from '../src/CreateLink'
import { verifyUserHasCorrectPermission } from '../src/VerifyUserHasCorrectPermission'
import { getLinkById} from '../src/GetLinkById'
import { UserPermissionLevel } from '../models/UserPermissionLevel'
import { LinkUpdateOptions, updateLink } from '../src/UpdateLink'
import * as ParameterParser from '../src/ParameterParser'


if(admin.apps.length === 0){
	admin.initializeApp(functions.config().firebase)
}
const links_app = express()
const cors = require('cors')
const links_main = express()

links_main.use(links_app)
links_app.use(express.json())
links_app.use(express.urlencoded({ extended: false }))

const firestoreTools = require('../firestoreTools')

export const link_main = functions.https.onRequest(links_main)

links_app.use(cors({origin:true}))
links_app.use(firestoreTools.flutterReformat)
links_app.use(firestoreTools.validateFirebaseIdToken)

/**
 * Gets a link from an Id
 * @query id - string id for the Link
 * @throws 401 - Unauthorized
 * @throws 408 - Link Doesn't Exist
 * @throws 500 - Server Error
 */
links_main.get('/', async (req, res) => {

    if(!req.query.id || req.query.id === ""){
        const error = APIResponse.MissingRequiredParameters()
		res.status(error.code).send(error.toJson())
    }
    else{
        try{
            res.status(APIResponse.SUCCESS_CODE).send(await getLinkById(req.query.id as string))
        }
        catch(suberror){
            if (suberror instanceof APIResponse){
                res.status(suberror.code).send(suberror.toJson())
            }
            else {
                console.log("FAILED WITH DB FROM link create ERROR: "+ suberror)
                const apiResponse = APIResponse.ServerError()
                res.status(apiResponse.code).send(apiResponse.toJson())
            }
        }
    }

})

/**
 * Creates a link model in the database
 * @body single_use - Bool for link being single scan
 * @body point_id - number that represents id of the Point Type
 * @body description - string the description for the link
 * @throws 400 - User not found
 * @throws 401 - Unauthorized
 * @throws 403 - Invalid Permissions
 * @throws 417 - Unkown Point type
 * @throws 418 - Point Type Disabled
 * @throws 422 - Missing Required Parameters
 * @throws 430 - Insufficent Permissions for Point Type
 * @throws 500 - Server Error
 */
links_main.post('/create' ,async (req, res) => {

    try{
        if(req.body === null || req.body === undefined){
            console.log("No body")
            throw APIResponse.MissingRequiredParameters()
        }
        const user_id = req["user"]["user_id"]
        const description = ParameterParser.parseInputForString(req.body.description)
        const point_id = ParameterParser.parseInputForNumber(req.body.point_id)
        const is_single_use = ParameterParser.parseInputForBoolean(req.body.single_use)
        const is_enabled = ParameterParser.parseInputForBoolean(req.body.is_enabled)

        const user = await getUser(user_id)
        const permissions = [UserPermissionLevel.RHP, UserPermissionLevel.PROFESSIONAL_STAFF, UserPermissionLevel.FACULTY, UserPermissionLevel.PRIVILEGED_RESIDENT, UserPermissionLevel.EXTERNAL_ADVISOR]
        verifyUserHasCorrectPermission(user, permissions)
        const link = await createLink(user,point_id, is_single_use, is_enabled, description)
        res.status(APIResponse.SUCCESS_CODE).send(link)
    }
    catch(suberror){
        if (suberror instanceof APIResponse){
            res.status(suberror.code).send(suberror.toJson())
        }
        else {
            console.log("FAILED WITH DB FROM link create ERROR: "+ suberror)
            const apiResponse = APIResponse.ServerError()
            res.status(apiResponse.code).send(apiResponse.toJson())
        }
    }
})

/**
 * Updates the link provided if the user is the owner
 * @body link_id - stringid of the link to update
 * @body archived - (Optional) bool for if the link is archived or not
 * @body enabled - (Optional) bool for if the link is enabled or not
 * @body description - (Optional) string for the description for the link
 * @body single_use - (Optional) bool for if the link can only be scanned once
 * @throws 401 - Unauthorized
 * @throws 407 - Link Doesn't Belong to User
 * @throws 408 - Link Doesn't Exist
 * @throws 422 - Missing Required Parameters
 * @throws 500 - Server Error
 */
links_main.put('/update' ,async (req, res) => {
    //Ensure that the link id exists so that it can be updated
    try{
        const linkId = ParameterParser.parseInputForString(req.body.link_id)
        const link = await getLinkById(linkId)
        let hasData = false
        const data:LinkUpdateOptions = {}
        if("archived" in req.body ){
            console.log("Updating archived");
            data.Archived = ParameterParser.parseInputForBoolean(req.body.archived)
            hasData = true
        }
        if("enabled" in req.body ){
            console.log("Updating enabled");
            data.Enabled = ParameterParser.parseInputForBoolean(req.body.enabled)
            hasData = true
        }
        if("description" in req.body ){
            console.log("Updating description");
            data.Description = ParameterParser.parseInputForString(req.body.description)
            hasData = true
        }
        if("singleUse" in req.body){
            console.log("Updating single_use");
            data.SingleUse = ParameterParser.parseInputForBoolean(req.body.singleUse)
            hasData = true
        }
        if(hasData){
            
            if(link.creatorId !== req["user"]["user_id"]){
                throw APIResponse.LinkDoesntBelongToUser()
            }
            else{
                await updateLink(linkId, data)
                throw APIResponse.Success()
            }

        }
        else{
            throw APIResponse.MissingRequiredParameters()
        }
    }
    catch(suberror){
        if (suberror instanceof APIResponse){
            console.error("")
            res.status(suberror.code).send(suberror.toJson())
        }
        else {
            console.log("FAILED WITH DB FROM link create ERROR: "+ suberror)
            const apiResponse = APIResponse.ServerError()
            res.status(apiResponse.code).send(apiResponse.toJson())
        }
    }
        
})