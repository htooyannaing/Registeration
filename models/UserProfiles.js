const mongoose = require('mongoose');

var UserProfileSchema = new mongoose.Schema({
    user_id :  mongoose.Schema.Types.ObjectId,
    personal : {
        name : String,
        nrc : String,
        ph : Number,
        dob : Date,
        profile_img : mongoose.Schema.Types.ObjectId
    },
    academic_hostories : {
        student_id :  mongoose.Schema.Types.ObjectId,
        idcard_img : mongoose.Schema.Types.ObjectId,
        role_no : String,
        university_id :  mongoose.Schema.Types.ObjectId,
        model_id  :  mongoose.Schema.Types.ObjectId,
        attended_year : Number,
        degree_id :  mongoose.Schema.Types.ObjectId,
        academic_started_year_month : Date,
        academic_ended_year_month : Date,
        related_technical_infos : String,
        projects_descriptions : String,
        status_flag : Number,
        wrong_infos : String
    },
    working_history : {
        position : String,
        company_name : String,
        salary : Number,
        start_date : Date,
        end_date : Date,
        related_technical_infos : String,
        projects_descriptions : String 
    },
    updated_user:mongoose.Schema.Types.ObjectId,
    updated_at:{
        type:Date
    },
    created_user:mongoose.Schema.Types.ObjectId,
    created_at:{
        type:Date,
        default:Date.now
    }
});

UserProfileSchema.statics.register = async function(userID, req){
    try {
        var user_id = userID

        /** Personal Detail */
        var personal_name = req.personal.name
        var personal_nrc = req.personal.nrc
        var personal_ph = req.personal.ph
        var personal_dob = req.personal.dob
        var personal_profile_img = req.personal.profile_img

        /** Academic History */
        /*
            var academic_hostories_student_id = req.academic_hostories.student_id
            var academic_hostories_idcard_img = req.academic_hostories.idcard_img
            var academic_hostories_role_no = req.academic_hostories.role_no
            var academic_hostories_university_id = req.academic_hostories.university_id
            var academic_hostories_model_id = req.academic_hostories.model_id
            var academic_hostories_attended_year = req.academic_hostories.attended_year
            var academic_hostories_degree_id = req.academic_hostories.degree_id
            var academic_hostories_academic_started_year_month = req.academic_hostories.academic_started_year_month
            var academic_hostories_academic_ended_year_month = req.academic_hostories.academic_ended_year_month
            var academic_hostories_related_technical_infos = req.academic_hostories.related_technical_infos
            var academic_hostories_projects_descriptions = req.academic_hostories.projects_descriptions
            var academic_hostories_status_flag = req.academic_hostories.status_flag
            var academic_hostories_wrong_infos = req.academic_hostories.wrong_infos
        */

        /** Woking History */
        /*
            var working_history_position = req.working_history.position
            var working_history_company_name = req.working_history.company_name
            var working_history_salary = req.working_history.salary
            var working_history_start_date = req.working_history.start_date
            var working_history_end_date = req.working_history.end_date
            var working_history_related_technical_infos = req.working_history.related_technical_infos
            var working_history_projects_descriptions = req.working_history.projects_descriptions
        */

        var regData = new UserProfile({
            user_id : user_id,
            personal : {
                name : personal_name,
                nrc : personal_nrc,
                ph : personal_ph,
                dob : personal_dob,
                profile_img : personal_profile_img
            }
        })

        var result = await regData.save()

        return {
            "status" : 200,
            "response" : result
        };
    } catch (e) {
        return {
            "status" : 409,
            "response" : e.__proto__.name + " : " + e.message
        }
    }
}

var UserProfile = mongoose.model('UserProfile',UserProfileSchema);
module.exports = {UserProfile};
    