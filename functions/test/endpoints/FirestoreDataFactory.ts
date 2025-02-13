///-----------------------------------------------------------------
///   Description:    Factory methods to create instances of models in the test database
///   Author:         Brian Johncox                    Date: April 2020
///   Notes:          
///                   - Type and defaults are declared in the OptionsDeclarations.ts file in the root test folder.
///                   - All methods should take the db and required parameters individually, then use the defaults for further customazation
///                   
///-----------------------------------------------------------------
import * as firebase from "@firebase/testing"
import * as Options from "../OptionDeclarations"

export class FirestoreDataFactory{

    /**
     * Sets the system preferences in the test database
     * 
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param spOpts - Optional parameters for the system preferences. If a field doesnt exist, it will be set to a default
     */
    static setSystemPreference(db:firebase.firestore.Firestore, spOpts:Options.SystemPreferenceOptions = Options.SYSTEM_PREFERENCES_DEFAULTS): Promise<void>{
        return db.collection("SystemPreferences").doc("Preferences").set({
            "Android_Version": (spOpts.android_version !== undefined)?spOpts.android_version:Options.SYSTEM_PREFERENCES_DEFAULTS.android_version,
            "OneTimeCode": (spOpts.one_time_code !== undefined)?spOpts.one_time_code:Options.SYSTEM_PREFERENCES_DEFAULTS.one_time_code,
            "competitionHiddenMessage": (spOpts.competition_hidden_message !== undefined)?spOpts.competition_hidden_message:Options.SYSTEM_PREFERENCES_DEFAULTS.competition_hidden_message,
            "houseEnabledMessage": (spOpts.house_enabled_message !== undefined)?spOpts.house_enabled_message:Options.SYSTEM_PREFERENCES_DEFAULTS.house_enabled_message,
            "iOS_Version":(spOpts.ios_version !== undefined)?spOpts.ios_version:Options.SYSTEM_PREFERENCES_DEFAULTS.ios_version,
            "isCompetitionVisible":(spOpts.is_competition_visible !== undefined)?spOpts.is_competition_visible:Options.SYSTEM_PREFERENCES_DEFAULTS.is_competition_visible,
            "isHouseEnabled": (spOpts.is_house_enabled !== undefined)?spOpts.is_house_enabled:Options.SYSTEM_PREFERENCES_DEFAULTS.is_house_enabled,
            "suggestedPointIDs": (spOpts.suggested_point_ids !== undefined)?spOpts.suggested_point_ids:Options.SYSTEM_PREFERENCES_DEFAULTS.suggested_point_ids,
            "houseIDs":(spOpts.houseIds !== undefined)?spOpts.houseIds:Options.SYSTEM_PREFERENCES_DEFAULTS.houseIds
        })
    }

    /**
     * Create or set the value of a point type for the given id
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param id - ID number for the point type
     * @param ptopts - Optional Parameters for the point type. Will be set to default if field isnt provided
     */
    static async setPointType(db: firebase.firestore.Firestore, id: number, ptopts:Options.PointTypeOptions = Options.POINT_TYPE_DEFAULTS): Promise<void>{
        await FirestoreDataFactory.setHousePointTypeDetails(db,"Copper", id,((ptopts.name !== undefined)? ptopts.name: Options.POINT_TYPE_DEFAULTS.name)!, 0,0)
        await FirestoreDataFactory.setHousePointTypeDetails(db,"Palladium", id,((ptopts.name !== undefined)? ptopts.name: Options.POINT_TYPE_DEFAULTS.name)!, 0,0)
        await FirestoreDataFactory.setHousePointTypeDetails(db,"Platinum", id,((ptopts.name !== undefined)? ptopts.name: Options.POINT_TYPE_DEFAULTS.name)!, 0,0)
        await FirestoreDataFactory.setHousePointTypeDetails(db,"Silver", id,((ptopts.name !== undefined)? ptopts.name: Options.POINT_TYPE_DEFAULTS.name)!, 0,0)
        await FirestoreDataFactory.setHousePointTypeDetails(db,"Titanium", id,((ptopts.name !== undefined)? ptopts.name: Options.POINT_TYPE_DEFAULTS.name)!, 0,0)
        
        return db.collection("PointTypes").doc(id.toString()).set({
            "Description":(ptopts.description !== undefined)? ptopts.description: Options.POINT_TYPE_DEFAULTS.description,
            "Name":(ptopts.name !== undefined)? ptopts.name: Options.POINT_TYPE_DEFAULTS.name,
            "Enabled":(ptopts.is_enabled !== undefined)? ptopts.is_enabled: Options.POINT_TYPE_DEFAULTS.is_enabled,
            "PermissionLevel":(ptopts.permission_level !== undefined)? ptopts.permission_level : Options.POINT_TYPE_DEFAULTS.permission_level,
            "ResidentsCanSubmit": (ptopts.residents_can_submit !== undefined)? ptopts.residents_can_submit : Options.POINT_TYPE_DEFAULTS.residents_can_submit,
            "Value": (ptopts.value !== undefined)? ptopts.value : Options.POINT_TYPE_DEFAULTS.value
        })
    }

    /**
     * Create or set the value for a house with the given id and create empty details documents
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param id - Name of the house
     * @param hOpts  - Optional Parameters for the house. Will be set to default if field isnt provided
     */
    static async setHouse(db: firebase.firestore.Firestore, id: string, hOpts:Options.HouseOptions = Options.HOUSE_DEFAULTS){
        await db.collection("House").doc(id).set({
            "Color":(hOpts.color !== undefined)? hOpts.color: Options.HOUSE_DEFAULTS.color,
            "NumberOfResidents":(hOpts.num_residents !== undefined)? hOpts.num_residents: Options.HOUSE_DEFAULTS.num_residents,
            "TotalPoints":(hOpts.total_points !== undefined)? hOpts.total_points: Options.HOUSE_DEFAULTS.total_points,
            "FloorIds":(hOpts.floor_ids !== undefined)? hOpts.floor_ids: Options.HOUSE_DEFAULTS.floor_ids,
            "DownloadUR":(hOpts.downloadURL !== undefined)? hOpts.downloadURL: Options.HOUSE_DEFAULTS.downloadURL,
            "Description": (hOpts.description !== undefined)? hOpts.description: Options.HOUSE_DEFAULTS.description
        })

        await db.collection("House").doc(id).collection("Details").doc("Rank").set({})
        await db.collection("House").doc(id).collection("Details").doc("PointTypes").set({})
    }

    /**
     * 
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param houseId - Id of the house to add the user rank to
     * @param userId - id of the user 
     * @param first - first name of the user
     * @param last - last name of the user
     * @param totalPoints - total points of the user
     * @param semesterPoints - semester points of the user
     */
    static async setUserHouseRank(db: firebase.firestore.Firestore, houseId: string, userId:string, first:string, last:string, totalPoints: number, semesterPoints:number){
        const userHouseRankDoc = await db.collection("House").doc(houseId).collection("Details").doc("Rank").get()
        if(userHouseRankDoc.exists){
            const updateData = {}
            updateData[userId] = {
                firstName: first,
                lastName: last,
                totalPoints: totalPoints,
                semesterPoints: semesterPoints
            }
            await db.collection("House").doc(houseId).collection("Details").doc("Rank").update(updateData)
        }
        else{
            throw Error("You havent created the house details docs yet when preparing the test")
        }
    }

    /**
     * 
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param houseId - Id of the house to add the point type count to
     * @param pointTypeId - Id for the point type
     * @param name - Name of the point type
     * @param submitted - number of submissions received
     * @param approved - number approved
     */
    static async setHousePointTypeDetails(db: firebase.firestore.Firestore, houseId: string, pointTypeId: number, name:string, submitted: number, approved: number){
        const pointTypesDoc = await db.collection("House").doc(houseId).collection("Details").doc("PointTypes").get()
        if(pointTypesDoc.exists){
            const data = {name: name, submitted: submitted, approved: approved}
            const map = {}
            map[pointTypeId.toString()] = data

            await db.collection("House").doc(houseId).collection("Details").doc("PointTypes").update(map)
        }
        else{
            throw Error("You havent created the detail docs yet when preparing the test")
        }
    }

    static setHouseCode(db: firebase.firestore.Firestore, id: string, cOpts:Options.HouseCodeOptions = Options.HOUSE_CODE_DEFAULTS): Promise<void> {
        return db.collection("HouseCodes").doc(id).set({
            "Code":(cOpts.code !== undefined)? cOpts.code: Options.HOUSE_CODE_DEFAULTS.code,
            "CodeName":(cOpts.code_name !== undefined)? cOpts.code: Options.HOUSE_CODE_DEFAULTS.code_name,
            "FloorId":(cOpts.floor_id !== undefined)? cOpts.code: Options.HOUSE_CODE_DEFAULTS.floor_id,
            "House":(cOpts.house !== undefined)? cOpts.house: Options.HOUSE_CODE_DEFAULTS.house,
            "PermissionLevel":(cOpts.permission_level !== undefined)? cOpts.permission_level: Options.HOUSE_CODE_DEFAULTS.permission_level
        })
    }

    /**
     * Create ell 5 houses in the competition. Default data will be used if none is provided in houseOpts
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param houseOpts - Optional Parameters for each of the houses. Will be set to defaults if not provided
     */
    static async setAllHouses(db: firebase.firestore.Firestore, houseOpts:Options.AllHousesOptions = Options.ALL_HOUSE_DEFAULTS){
        await this.setHouse(db,"Copper", (houseOpts.copper !== undefined) ? houseOpts.copper : Options.ALL_HOUSE_DEFAULTS.copper)
        await this.setHouse(db,"Palladium", (houseOpts.palladium !== undefined) ? houseOpts.palladium : Options.ALL_HOUSE_DEFAULTS.palladium)
        await this.setHouse(db,"Platinum", (houseOpts.platinum !== undefined) ? houseOpts.platinum : Options.ALL_HOUSE_DEFAULTS.platinum)
        await this.setHouse(db,"Silver", (houseOpts.silver !== undefined) ? houseOpts.silver : Options.ALL_HOUSE_DEFAULTS.silver)
        await this.setHouse(db,"Titanium", (houseOpts.titanium !== undefined) ? houseOpts.titanium : Options.ALL_HOUSE_DEFAULTS.titanium)
    }

    /**
     * Create or set teh value for a user with the ID and permission level
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param id - Id for the user
     * @param permission_level - int that represents the permission level
     * @param uOpts - Optional parameters for the user. Will be set to default if field isn't provided
     */
    static setUser(db: firebase.firestore.Firestore, id: string, permission_level: number, uOpts:Options.UserOptions = Options.USER_DEFAULTS): Promise<void> {
        switch(permission_level){
            case 0:
                //Resident
                return db.collection("Users").doc(id).set({
                    "FirstName":(uOpts.first !== undefined)? uOpts.first: Options.USER_DEFAULTS.first, 
                    "FloorID":(uOpts.floor_id !== undefined)? uOpts.floor_id:Options.USER_DEFAULTS.floor_id,
                    "House":(uOpts.house_name !== undefined)? uOpts.house_name:Options.USER_DEFAULTS.house_name,
                    "LastName":(uOpts.last !== undefined)? uOpts.last:Options.USER_DEFAULTS.last,
                    "SemesterPoints":(uOpts.semester_points !== undefined)? uOpts.semester_points: Options.USER_DEFAULTS.semester_points,
                    "Permission Level":0, 
                    "TotalPoints":(uOpts.total_points !== undefined)? uOpts.total_points: Options.USER_DEFAULTS.total_points
                })
            case 1:
                //RHP
                return db.collection("Users").doc(id).set({
                    "FirstName":(uOpts.first !== undefined)? uOpts.first: Options.USER_DEFAULTS.first, 
                    "FloorID":(uOpts.floor_id !== undefined)? uOpts.floor_id:Options.USER_DEFAULTS.floor_id,
                    "House":(uOpts.house_name !== undefined)? uOpts.house_name:Options.USER_DEFAULTS.house_name,
                    "LastName":(uOpts.last !== undefined)? uOpts.last:Options.USER_DEFAULTS.last,
                    "SemesterPoints":(uOpts.semester_points !== undefined)? uOpts.semester_points: Options.USER_DEFAULTS.semester_points,
                    "Permission Level":1, 
                    "TotalPoints":(uOpts.total_points !== undefined)? uOpts.total_points: Options.USER_DEFAULTS.total_points
                })
            case 2:
                //REC
                return db.collection("Users").doc(id).set({
                    "FirstName":(uOpts.first !== undefined)? uOpts.first: Options.USER_DEFAULTS.first,
                    "LastName":(uOpts.last !== undefined)? uOpts.last:Options.USER_DEFAULTS.last,
                    "Permission Level":2
                })
            case 3:
                //FHP
                return db.collection("Users").doc(id).set({
                    "FirstName":(uOpts.first !== undefined)? uOpts.first: Options.USER_DEFAULTS.first, 
                    "House":(uOpts.house_name !== undefined)? uOpts.house_name:Options.USER_DEFAULTS.house_name,
                    "LastName":(uOpts.last !== undefined)? uOpts.last:Options.USER_DEFAULTS.last,
                    "Permission Level":3
                })
            case 4:
                //Privileged Resident
                return db.collection("Users").doc(id).set({
                    "FirstName":(uOpts.first !== undefined)? uOpts.first: Options.USER_DEFAULTS.first, 
                    "FloorID":(uOpts.floor_id !== undefined)? uOpts.floor_id:Options.USER_DEFAULTS.floor_id,
                    "House":(uOpts.house_name !== undefined)? uOpts.house_name:Options.USER_DEFAULTS.house_name,
                    "LastName":(uOpts.last !== undefined)? uOpts.last:Options.USER_DEFAULTS.last,
                    "SemesterPoints":(uOpts.semester_points !== undefined)? uOpts.semester_points: Options.USER_DEFAULTS.semester_points,
                    "Permission Level":4, 
                    "TotalPoints":(uOpts.total_points !== undefined)? uOpts.total_points: Options.USER_DEFAULTS.total_points
                })
            case 5:
                //Non-Honors Affiliated Staff
                return db.collection("Users").doc(id).set({
                    "FirstName":(uOpts.first !== undefined)? uOpts.first: Options.USER_DEFAULTS.first,
                    "LastName":(uOpts.last !== undefined)? uOpts.last:Options.USER_DEFAULTS.last,
                    "Permission Level":5
                })
            default:
                return db.collection("Users").doc(id).set({
                    "FirstName":(uOpts.first !== undefined)? uOpts.first: Options.USER_DEFAULTS.first, 
                    "FloorID":(uOpts.floor_id !== undefined)? uOpts.floor_id:Options.USER_DEFAULTS.floor_id,
                    "House":(uOpts.house_name !== undefined)? uOpts.house_name:Options.USER_DEFAULTS.house_name,
                    "LastName":(uOpts.last !== undefined)? uOpts.last:Options.USER_DEFAULTS.last,
                    "SemesterPoints":(uOpts.semester_points !== undefined)? uOpts.semester_points: Options.USER_DEFAULTS.semester_points,
                    "Permission Level":0, 
                    "TotalPoints":(uOpts.total_points !== undefined)? uOpts.total_points: Options.USER_DEFAULTS.total_points
                })
        }
    }
    
    /**
     * Create or update a pointlog
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param house - name of the house to add point log for
     * @param resident_id - id of resident to add point log for
     * @param handled - boolean for if the pointlog was already handled. (used to set the approved fields and sign of point type ID)
     * @param ptOpts - Optional parameters to modifu the point log
     */
    static setPointLog(db: firebase.firestore.Firestore, house:string, resident_id:string, handled: boolean, ptOpts:Options.PointLogOptions = Options.POINT_LOG_DEFAULTS): Promise<void> | Promise<firebase.firestore.DocumentReference>{
        let data = {
            "DateOccurred":(ptOpts.date_occurred !== undefined)?ptOpts.date_occurred:Options.POINT_LOG_DEFAULTS.date_occurred,
            "DateSubmitted":(ptOpts.date_submitted !== undefined)?ptOpts.date_submitted:Options.POINT_LOG_DEFAULTS.date_submitted,
            "Description":(ptOpts.description !== undefined)?ptOpts.description:Options.POINT_LOG_DEFAULTS.description,
            "FloorID":(ptOpts.floor_id !== undefined)?ptOpts.floor_id:Options.POINT_LOG_DEFAULTS.floor_id,
            "PointTypeID":(ptOpts.point_type_id !== undefined)?ptOpts.point_type_id * -1 :Options.POINT_LOG_DEFAULTS.point_type_id! * -1,
            "PointTypeName":(ptOpts.point_type_name !== undefined)?ptOpts.point_type_name:Options.POINT_LOG_DEFAULTS.point_type_name!,
            "PointTypeDescription":(ptOpts.point_type_description !== undefined)?ptOpts.point_type_description:Options.POINT_LOG_DEFAULTS.point_type_description!,
            "RHPNotifications":(ptOpts.rhp_notifications !== undefined)?ptOpts.rhp_notifications:Options.POINT_LOG_DEFAULTS.rhp_notifications,
            "ResidentFirstName":(ptOpts.resident_first_name !== undefined)?ptOpts.resident_first_name:Options.POINT_LOG_DEFAULTS.resident_first_name,
            "ResidentId":resident_id,
            "ResidentLastName":(ptOpts.resident_last_name !== undefined)?ptOpts.resident_last_name:Options.POINT_LOG_DEFAULTS.resident_last_name,
            "ResidentNotifications":(ptOpts.resident_notifications !== undefined)?ptOpts.resident_notifications:Options.POINT_LOG_DEFAULTS.resident_notifications
        }
        if(handled){
            data["ApprovedBy"] = (ptOpts.approved_by !== undefined)?ptOpts.approved_by:Options.POINT_LOG_DEFAULTS.approved_by
            data["ApprovedOn"] = (ptOpts.approved_on !== undefined)?ptOpts.approved_on:Options.POINT_LOG_DEFAULTS.approved_on
            data["PointTypeID"] = data["PointTypeID"] * -1
            const approved = (ptOpts.approved !== undefined)?ptOpts.approved:Options.POINT_LOG_DEFAULTS.approved
            if(!approved){
                data["Description"] = "DENIED: "+data["Description"]
            }
        }
        if(ptOpts.id){
            return db.collection("House").doc(house).collection("Points").doc(ptOpts.id!).set(data)
        }
        else{
            return db.collection("House").doc(house).collection("Points").add(data)
        }
        
    }

    /**
     * 
     * @param db - Test App Firestore instance (Usually from authedApp())
     * @param link_id - ID of the link to be created
     * @param creator_id - ID of the user to whom the link belongs
     * @param point_type_id - Id of the point type to connect this link to
     * @param linkOpts - Options for the link
     */
    static setLink(db: firebase.firestore.Firestore, link_id: string, creator_id: string, point_type_id: number, linkOpts: Options.LinkOptions = Options.LINK_DEFAULTS){
        let data = {
            Archived:(linkOpts.archived !== undefined)?linkOpts.archived:Options.LINK_DEFAULTS.archived,
            CreatorID:creator_id,
            Description:(linkOpts.description !== undefined)?linkOpts.description:Options.LINK_DEFAULTS.description,
            Enabled: (linkOpts.enabled !== undefined)?linkOpts.enabled:Options.LINK_DEFAULTS.enabled,
            PointID: point_type_id,
            SingleUse: (linkOpts.single_use !== undefined)?linkOpts.single_use:Options.LINK_DEFAULTS.single_use,
            ClaimedCount: (linkOpts.claimed_count !== undefined)?linkOpts.claimed_count:Options.LINK_DEFAULTS.claimed_count
        }
        return db.collection("Links").doc(link_id).set(data)
    }

    /**
     * Create an instance of a Point Log Message in the database. However, make sure the House and the Point Log models exist first
     * @param db  - Test App Firestore instance (Usually from authedApp())
     * @param house_id - ID of the house that the point log belongs to
     * @param log_id - ID of the point log to add the message to
     * @param messageOpts - Optional parameters to modify the message
     */
    static setPointLogMessage(db: firebase.firestore.Firestore, house_id: string, log_id: string, messageOpts: Options.PointLogMessageOptions = Options.MESSAGE_DEFAULTS){
        let data = {
            CreationDate:(messageOpts.creation_date !== undefined)?messageOpts.creation_date:Options.MESSAGE_DEFAULTS.creation_date,
            Message:(messageOpts.message !== undefined)?messageOpts.message:Options.MESSAGE_DEFAULTS.message,
            MessageType:(messageOpts.message_type !== undefined)? messageOpts.message_type:Options.MESSAGE_DEFAULTS.message_type,
            SenderFirstName:(messageOpts.sender_first_name !== undefined)? messageOpts.sender_first_name: Options.MESSAGE_DEFAULTS.sender_first_name,
            SenderLastName:(messageOpts.sender_last_name !== undefined)? messageOpts.sender_last_name: Options.MESSAGE_DEFAULTS.sender_last_name,
            SenderPermissionLevel:(messageOpts.sender_permission_level !== undefined)? messageOpts.sender_permission_level:Options.MESSAGE_DEFAULTS.sender_permission_level
        }
        return db.collection("House").doc(house_id).collection("Points").doc(log_id).collection("Messages").add(data)
    }

    /**
     * Create multiple pointlogs for the given user
     * @param db  - Test App Firestore instance (Usually from authedApp())
     * @param house - ID of house to make point logs for
     * @param resident_id - id of resident to make point logs for
     * @param count - number of point logs to create
     */
    static async createMultiplePointLogs(db: firebase.firestore.Firestore, house:string, resident_id:string, count:number){
        for(let i = 0; i < count; i++){
            await this.setPointLog(db, house, resident_id, true)
        }
    }

    /**
     * Create or update a reward
     * @param db  - Test App Firestore instance (Usually from authedApp())
     * @param rOpts - Optional parameters for the Reward
     */
    static setReward(db: firebase.firestore.Firestore, id:string, rOpts:Options.RewardOptions = Options.REWARD_DEFAULTS): Promise<void> {
        return db.collection("Rewards").doc(id).set({
            FileName:(rOpts.file_name !== undefined)?rOpts.file_name:Options.REWARD_DEFAULTS.file_name,
            RequiredPPR:(rOpts.required_ppr !== undefined)?rOpts.required_ppr:Options.REWARD_DEFAULTS.required_ppr,
            Name:(rOpts.name !== undefined)?rOpts.name:Options.REWARD_DEFAULTS.name,
            DownloadURL:(rOpts.downloadURL !== undefined)?rOpts.downloadURL:Options.REWARD_DEFAULTS.downloadURL,

        })
    }

    /**
     * Create an event
     * @param db 
     * @param creator_id
     * @param eOpts 
     */
    static setEvent(db: firebase.firestore.Firestore, id: string, creator_id: string, eOpts:Options.EventOptions = Options.EVENT_DEFAULTS): Promise<void> {
        const data = {
            "Name": (eOpts.name !== undefined)?eOpts.name:Options.EVENT_DEFAULTS.name,
            "Details": (eOpts.details !== undefined)?eOpts.details:Options.EVENT_DEFAULTS.details,
            "Date": (eOpts.date !== undefined)?eOpts.date:Options.EVENT_DEFAULTS.date,
            "Location": (eOpts.location !== undefined)?eOpts.location:Options.EVENT_DEFAULTS.location,
            "Points": (eOpts.points !== undefined)?eOpts.points:Options.EVENT_DEFAULTS.points,
            "PointTypeID": (eOpts.point_type_id !== undefined)?eOpts.point_type_id:Options.EVENT_DEFAULTS.point_type_id,
            "PointTypeName": (eOpts.point_type_name !== undefined)?eOpts.point_type_name:Options.EVENT_DEFAULTS.point_type_name,
            "PointTypeDescription": (eOpts.point_type_description !== undefined)?eOpts.point_type_description:Options.EVENT_DEFAULTS.point_type_description,
            "House": (eOpts.house !== undefined)?eOpts.house:Options.EVENT_DEFAULTS.house,
            "CreatorID":creator_id
        }
        return db.collection("Events").doc(id).set(data)
    }

    /**
     * Run this after events test to clean events
     * @param db Test App Firestore instance
     */
    static async cleanEvents(db: firebase.firestore.Firestore) {
        await FirestoreDataFactory.deleteCollection(db, "Events", 100)
    }

    static async getCompetitionPointsStatus(db: firebase.firestore.Firestore, house:string, user_id:string): Promise<CompetitionPointStatus> {
        const user_doc = await db.collection("Users").doc(user_id).get()
        const house_doc = await db.collection("House").doc(house).get()
        const status: PointStatus = {
            user_points: user_doc.data()!["TotalPoints"],
            user_semester_points: user_doc.data()!["SemesterPoints"],
            house_points: house_doc.data()!["TotalPoints"]
        }
        return new CompetitionPointStatus(status)
    }

    static async createAllHouseCodes(db: firebase.firestore.Firestore ){
        await FirestoreDataFactory.setHouseCode(db, "2NResident", {code:"OLDCODE", code_name:"2N Resident", floor_id:"2N", house:"Copper", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "2SResident", {code:"OLDCODE", code_name:"2S Resident", floor_id:"2S", house:"Copper", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "3NResident", {code:"OLDCODE", code_name:"3N Resident", floor_id:"3N", house:"Palladium", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "3SResident", {code:"OLDCODE", code_name:"3S Resident", floor_id:"3S", house:"Palladium", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "4NResident", {code:"OLDCODE", code_name:"4N Resident", floor_id:"4N", house:"Platinum", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "4SResident", {code:"OLDCODE", code_name:"4S Resident", floor_id:"4S", house:"Platinum", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "5NResident", {code:"OLDCODE", code_name:"5N Resident", floor_id:"5N", house:"Silver", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "5SResident", {code:"OLDCODE", code_name:"5S Resident", floor_id:"5S", house:"Silver", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "6NResident", {code:"OLDCODE", code_name:"6N Resident", floor_id:"6N", house:"Titanium", permission_level:0})
        await FirestoreDataFactory.setHouseCode(db, "6SResident", {code:"OLDCODE", code_name:"6S Resident", floor_id:"6S", house:"Titanium", permission_level:0})

        await FirestoreDataFactory.setHouseCode(db, "2NRHP", {code:"OLDCODE", code_name:"2N RHP", floor_id:"2N", house:"Copper", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "2SRHP", {code:"OLDCODE", code_name:"2S RHP", floor_id:"2S", house:"Copper", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "3NRHP", {code:"OLDCODE", code_name:"3N RHP", floor_id:"3N", house:"Palladium", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "3SRHP", {code:"OLDCODE", code_name:"3S RHP", floor_id:"3S", house:"Palladium", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "4NRHP", {code:"OLDCODE", code_name:"4N RHP", floor_id:"4N", house:"Platinum", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "4SRHP", {code:"OLDCODE", code_name:"4S RHP", floor_id:"4S", house:"Platinum", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "5NRHP", {code:"OLDCODE", code_name:"5N RHP", floor_id:"5N", house:"Silver", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "5SRHP", {code:"OLDCODE", code_name:"5S RHP", floor_id:"5S", house:"Silver", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "6NRHP", {code:"OLDCODE", code_name:"6N RHP", floor_id:"6N", house:"Titanium", permission_level:1})
        await FirestoreDataFactory.setHouseCode(db, "6SRHP", {code:"OLDCODE", code_name:"6S RHP", floor_id:"6S", house:"Titanium", permission_level:1})

        await FirestoreDataFactory.setHouseCode(db, "PROFST", {code:"OLDCODE", code_name: "Professional Staff", permission_level:2})

        await FirestoreDataFactory.setHouseCode(db, "CPFHP1", {code:"OLDCODE", code_name:"Copper FHP", house:"Copper", permission_level:3})
        await FirestoreDataFactory.setHouseCode(db, "PDFHP1", {code:"OLDCODE", code_name:"Palladium RHP", house:"Palladium", permission_level:3})
        await FirestoreDataFactory.setHouseCode(db, "PTFHP1", {code:"OLDCODE", code_name:"Platinum RHP", house:"Platinum", permission_level:3})
        await FirestoreDataFactory.setHouseCode(db, "SIFHP1", {code:"OLDCODE", code_name:"Silver RHP", house:"Silver", permission_level:3})
        await FirestoreDataFactory.setHouseCode(db, "TIFHP1", {code:"OLDCODE", code_name:"Titanium RHP", house:"Titanium", permission_level:3})

        await FirestoreDataFactory.setHouseCode(db, "2NPRIV", {code:"OLDCODE", code_name:"2N PRIV", floor_id:"2N", house:"Copper", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "2SPRIV", {code:"OLDCODE", code_name:"2S PRIV", floor_id:"2S", house:"Copper", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "3NPRIV", {code:"OLDCODE", code_name:"3N PRIV", floor_id:"3N", house:"Palladium", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "3SPRIV", {code:"OLDCODE", code_name:"3S PRIV", floor_id:"3S", house:"Palladium", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "4NPRIV", {code:"OLDCODE", code_name:"4N PRIV", floor_id:"4N", house:"Platinum", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "4SPRIV", {code:"OLDCODE", code_name:"4S PRIV", floor_id:"4S", house:"Platinum", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "5NPRIV", {code:"OLDCODE", code_name:"5N PRIV", floor_id:"5N", house:"Silver", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "5SPRIV", {code:"OLDCODE", code_name:"5S PRIV", floor_id:"5S", house:"Silver", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "6NPRIV", {code:"OLDCODE", code_name:"6N PRIV", floor_id:"6N", house:"Titanium", permission_level:4})
        await FirestoreDataFactory.setHouseCode(db, "6SPRIV", {code:"OLDCODE", code_name:"6S PRIV", floor_id:"6S", house:"Titanium", permission_level:4})

        await FirestoreDataFactory.setHouseCode(db, "EXTADV", {code:"OLDCODE", code_name: "External Advisor", permission_level:5})
    }

    /**
     * run this after test to clean the database
     * @param db Test App Firestore instance
     */
    static async cleanDatabase(db: firebase.firestore.Firestore){

        //This technically doesnt delete any point log messages, but because 
        // the odds of them causing issue in other tests is minimal, we don't care.

        //Delete points from each house.
        await FirestoreDataFactory.deleteCollection(db, "House/Copper/Points",100)
        await FirestoreDataFactory.deleteCollection(db, "House/Palladium/Points",100)
        await FirestoreDataFactory.deleteCollection(db, "House/Platinum/Points",100)
        await FirestoreDataFactory.deleteCollection(db, "House/Silver/Points",100)
        await FirestoreDataFactory.deleteCollection(db, "House/Titanium/Points",100)

        //Delete root levels
        await FirestoreDataFactory.deleteCollection(db, "Events",100)
        await FirestoreDataFactory.deleteCollection(db, "House",100)
        await FirestoreDataFactory.deleteCollection(db, "HouseCodes",100)
        await FirestoreDataFactory.deleteCollection(db, "Links",100)
        await FirestoreDataFactory.deleteCollection(db, "PointTypes",100)
        await FirestoreDataFactory.deleteCollection(db, "Rewards",100)
        await FirestoreDataFactory.deleteCollection(db, "Users",100)
    }


    /**
     * Deletes a collection from the db using a batch processes
     * @param db Test App Firestore instance
     * @param collectionPath Path to collection
     * @param batchSize max number to delete in batch
     */
    static async deleteCollection(db, collectionPath, batchSize) {
        const collectionRef = db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);
      
        return new Promise((resolve, reject) => {
          FirestoreDataFactory.deleteQueryBatch(db, query, resolve).catch(reject);
        });
      }
      
    private static async deleteQueryBatch(db, query, resolve) {
        const snapshot = await query.get();
      
        const batchSize = snapshot.size;
        if (batchSize === 0) {
          // When there are no documents left, we are done
          resolve();
          return;
        }
      
        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          FirestoreDataFactory.deleteQueryBatch(db, query, resolve);
        });
      }
}



export class CompetitionPointStatus {
    status: PointStatus

    constructor(status: PointStatus){
        this.status = status
    }

    /**
     * returns a copy of the original status with an added offset
     * @param value number of points to offset by
     */
    offset(value:number): PointStatus{
        let offsetStatus: PointStatus = { 
            user_points: this.status.user_points + value,
            house_points: this.status.house_points + value,
            user_semester_points: this.status.user_semester_points + value
        }
        
        return offsetStatus
    }
}

export declare type PointStatus = {
    user_points:number,
    user_semester_points:number,
    house_points:number
}