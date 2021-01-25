'use strict';

/**
 * Configuration file where you can store error codes for responses
 *
 * It's just a storage where you can define your custom API errors and their description.
 * You can call then in your action res.ok(data, sails.config.errors.USER_NOT_FOUND);
 */
module.exports = {
    message: {
        BAD_REQUEST: {
            code: 'E_BAD_REQUEST',
            message: 'The request cannot be fulfilled due to bad syntax',
            status: 400
        },
        CREATED: {
            code: 'CREATED',
            message: 'The request has been fulfilled and resulted in a new resource being created',
            status: 201
        },
        CREATE_FAILED: {
            code: 'CREATE_FAILED',
            message: 'The request has not been fulfilled, Please try again',
            status: 500
        },
        IS_REQUIRED: {
            message: 'is required.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        IS_DUPLICATE: {
            message: 'already exists.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        REQUIRED_FIELD_MISSING: {
            message: 'Required field missing.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        REQUIRED_MODEL_NAME: {
            message: 'Model name is required.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        CREATE_FAILED_WITH_ID: {
            message: 'Can not create record with id.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        INVALID_FIELD: {
            message: ': field not exists.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        INVALID_FIELD_TYPE: {
            message: ' must be type of ',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        REQUIRED_MODEL_TYPE: {
            message: ' : Type missing in model.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        REQUIRED_MODEL_COLUMN_TYPE: {
            message: ' : Column Type missing in model.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        REQUIRED_MODEL_DESCRIPTION: {
            message: ' : Description missing in model.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        INVALID_MODEL_NAME: {
            message: 'Invalid model.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        FORBIDDEN: {
            code: 'E_FORBIDDEN',
            message: 'User not authorized to perform the operation',
            status: 403
        },
        CANT_CHANGE_USER_TYPE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Can not change user type. Requested user is Parent of some user(s)',
            status: 422
        },
        NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'The requested resource could not be found but may be available again in the future',
            status: 404
        },
        RECORD_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Record not found',
            status: 404
        },
        OK: {
            code: 'OK',
            message: 'Operation is successfully executed',
            status: 200
        },
        DOCUMENTS_UPDATED: {
            code: 'OK',
            message: 'Documents is successfully updated.',
            status: 200
        },
        LOGOUT: {
            code: 'OK',
            message: 'Successfully logout.',
            status: 200
        },
        PLAYERID_SAVED: {
            code: 'OK',
            message: 'Player Id saved successfully.',
            status: 200
        },
        PLAYERID_DUPLICATE: {
            code: 'E_DUPLICATE_TITLE_FOUND',
            message: 'Player id already exists.',
            status: 200
        },
        SERVER_ERROR: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Something bad happened on the server',
            status: 500
        },
        UNAUTHORIZED: {
            code: 'E_UNAUTHORIZED',
            message: 'Missing or invalid authentication token',
            status: 401
        },
        USER_NOT_FOUND: {
            code: 'E_USER_NOT_FOUND',
            message: 'User with specified credentials is not found',
            status: 401
        },
        USER_REGISTERED: {
            code: 'OK',
            message: 'User registered successfully.',
            status: 200
        },
        USER_UPDATED: {
            code: 'OK',
            message: 'User updated successfully.',
            status: 200
        },
        DOCTOR_ASSIGNED: {
            code: 'OK',
            message: 'Doctor assigned successfully.',
            status: 200
        },
        ASSIGNED_DOCTOR_REMOVE: {
            code: 'OK',
            message: 'Doctor remove successfully.',
            status: 200
        },
        EMAIL_REGISTERED: {
            code: 'E_DUPLICATE',
            message: 'Email already registered.',
            status: 200
        },
        MOBILE_REGISTERED: {
            code: 'E_DUPLICATE',
            message: 'Mobile already registered.',
            status: 200
        },
        USER_NOT_ACTIVE: {
            code: 'E_UNAUTHORIZED',
            message: 'Your account is deactivated, please contact support team for assistance.',
            status: 200
        },
        USER_EMAIL_NOT_VERIFIED: {
            code: 'E_UNAUTHORIZED',
            message: 'Your email is not verified.',
            status: 200
        },
        USER_MOBILE_NOT_VERIFIED: {
            code: 'E_UNAUTHORIZED',
            message: 'Your mobile is not verified.',
            status: 200
        },
        USERNAME_REGISTERED: {
            code: 'E_DUPLICATE',
            message: 'Username already registered.',
            status: 200
        },
        USER_REGISTER_FAILED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: ' Failed to registered user.',
            status: 401
        },
        LOGIN: {
            code: 'OK',
            message: 'Successfully login.',
            status: 200
        },
        INVALID_USERNAME: {
            code: 'E_BAD_REQUEST',
            message: 'Invalid username.',
            status: 401
        },
        INVALID_PASSWORD: {
            code: 'E_BAD_REQUEST',
            message: 'Invalid password.',
            status: 401
        },
        INVALID_TOKEN: {
            code: 'E_BAD_REQUEST',
            message: 'Invalid token.',
            status: 401
        },
        INVALID_OTP: {
            code: 'E_BAD_REQUEST',
            message: 'Invalid OTP.',
            status: 401
        },
        PROFILE_UPDATED: {
            code: 'OK',
            message: 'Profile updated successfully.',
            status: 200
        },

        USER_LIST_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'User not found.',
            status: 404
        },
        USER_DELETED: {
            code: 'OK',
            message: 'User(s) deleted successfully.',
            status: 200
        },
        USER_PASSWORD_RESET: {
            code: 'OK',
            message: 'Password changed successfully.',
            status: 200
        },
        USER_OTP_SENT: {
            code: 'OK',
            message: 'Password reset otp sent successfully.',
            status: 200
        },

        OTP_VERIFIED: {
            code: 'OK',
            message: 'OTP verified successfully.',
            status: 200
        },

        OTP_SENT: {
            code: 'OK',
            message: 'OTP sent successfully.',
            status: 200
        },
        RESET_PASSWORD_LINK_EXPIRE: {
            code: 'E_BAD_REQUEST',
            message: 'Your reset password link is expired on invalid',
            status: 401
        },
        OTP_EXPIRE: {
            code: 'E_BAD_REQUEST',
            message: 'Your OTP has expires.',
            status: 401
        },
        // MASTER
        NAME_ALREADY_EXISTS: {
            code: 'E_DUPLICATE',
            message: 'Name / Code already registered, please try another',
            status: 200
        },
        SET_IN_ACTIVE_MASTER_AS_DEFAULT: {
            code: 'E_SET_IN_ACTIVE_MASTER_AS_DEFAULT',
            message: 'Inactive master can not be set as default. Please active it first.',
            status: 200
        },
        MASTER_CREATED: {
            code: 'OK',
            message: 'Master created successfully.',
            status: 200
        },
        SUB_MASTER_CREATED: {
            code: 'OK',
            message: 'Sub Master created successfully.',
            status: 200
        },
        SUB_MASTER_UPDATED: {
            code: 'OK',
            message: 'Sub Master updated successfully.',
            status: 200
        },
        MASTER_UPDATED: {
            code: 'OK',
            message: 'Master updated successfully.',
            status: 200
        },
        MASTER_DELETED: {
            code: 'OK',
            message: 'Master(s) deleted successfully.',
            status: 200
        },
        MASTER_DELETE_DEP: {
            code: 'E_DELETE_DEP',
            message: 'The master exists in sub masters. please remove it first',
            status: 401
        },
        EMAIL_VERIFIED: {
            code: 'OK',
            message: 'Your email address has been successfully verified.',
            status: 200
        },
        MOBILE_VERIFIED: {
            code: 'OK',
            message: 'Your mobile number has been successfully verified.',
            status: 200
        },
        INVALID_VERIFICATION_TOKEN: {
            code: 'E_USER_NOT_FOUND',
            message: 'Your token is invalid or expired.',
            status: 401
        },
        EMAIL_ALREADY_VERIFIED: {
            code: 'E_BAD_REQUEST',
            message: 'Email is already verified.',
            status: 401
        },
        MOBILE_ALREADY_VERIFIED: {
            code: 'E_BAD_REQUEST',
            message: 'Mobile number is already verified.',
            status: 401
        },
        EMAIL_VERIFICATION: {
            code: 'OK',
            message: 'Please check your email for verification link.',
            status: 200
        },
        MOBILE_VERIFICATION: {
            code: 'OK',
            message: 'OTP has been sent to your mobile number.',
            status: 200
        },
        RESET_PASSWORD_LINK: {
            code: 'OK',
            message: 'Please check your email to reset your password.',
            status: 200
        },
        USER_NOT_EXIST_FOR_EMAIL: {
            code: 'E_NOT_FOUND',
            message: 'This email address is not registered.',
            status: 200
        },

        INVALID_DEVICE: {
            code: 'E_BAD_REQUEST',
            message: 'Invalid device for the requested user.',
            status: 401
        },

        NO_RECORD_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'No record found.',
            status: 402
        },

        VEHICLE_FAILED_CREATED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Failed to create %@',
            status: 401
        },
        VEHICLE_CREATED: {
            code: 'OK',
            message: '%@ created successfully.',
            status: 200
        },
        VEHICLE_UPDATED: {
            code: 'OK',
            message: '%@ updated successfully.',
            status: 200
        },
        VEHICLE_DELETED: {
            code: 'OK',
            message: '%@ deleted successfully.',
            status: 200
        },
        VEHICLE_CAN_NOT_DELETED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: "%@ is booked. Can't delete it.",
            status: 401
        },
        VEHICLE_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: '%@ record not found.',
            status: 404
        },
        VEHICLE_FOUND_SUCCESSFULLY: {
            code: 'OK',
            message: '%@ found successfully.',
            status: 200
        },
        SCOOTER_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Scooter not found.',
            status: 401
        },
        SCOOTER_NOT_AVAILABLE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Scooter is not available.',
            status: 401
        },
        ALREADY_RESERVED_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You have already reserved one ride.',
            status: 401
        },
        ALREADY_STARTED_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You have already started one ride.',
            status: 401
        },
        RESERVED_OTHER_VEHICLE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You have reserved another vehicle for ride.',
            status: 401
        },
        SCOOTER_LOW_BATTERY: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Scooter has not enough battery for ride.',
            status: 401
        },
        SETTINGS_CREATED: {
            code: 'OK',
            message: 'Setting successfully created.',
            status: 200
        },

        LIST_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'List not found.',
            status: 200
        },

        VEHICLE_CAN_NOT_ADDED_BY_YOU: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You can not add vehicle.',
            status: 401
        },
        EMAIL_NOT_REGISTERED: {
            code: 'E_DUPLICATE',
            message: "This isn't an email we know.",
            status: 200
        },
        CANCELLATION_REASON_FAILED_CREATED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Failed to create Cancellation Reason.',
            status: 401
        },
        CANCELLATION_REASON_CREATED: {
            code: 'OK',
            message: 'Cancellation Reason created successfully.',
            status: 200
        },
        CANCELLATION_REASON_UPDATED: {
            code: 'OK',
            message: 'Cancellation Reason updated successfully.',
            status: 200
        },
        CANCELLATION_REASON_DELETED: {
            code: 'OK',
            message: 'Cancellation Reason deleted successfully.',
            status: 200
        },
        CANCELLATION_REASON_NOT_FOUND: {
            code: 'OK',
            message: 'Cancellation Reason record not found.',
            status: 200
        },
        PROMO_CODE_FAILED_CREATED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Failed to create Promo Code.',
            status: 401
        },
        PROMO_CODE_CREATED: {
            code: 'OK',
            message: 'Promo Code created successfully.',
            status: 200
        },
        PROMO_CODE_UPDATED: {
            code: 'OK',
            message: 'Promo Code updated successfully.',
            status: 200
        },
        PROMO_CODE_DELETED: {
            code: 'OK',
            message: 'Promo Code deleted successfully.',
            status: 200
        },
        PROMO_CODE_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Promo Code record not found.',
            status: 401
        },
        PROMO_CODE_NOT_APPLIED: {
            code: 'OK',
            message: 'Promo Code not applied.',
            status: 200
        },
        PROMO_CODE_APPLIED: {
            code: 'OK',
            message: 'Promo Code applied.',
            status: 200
        },
        FEEDBACK_CREATED: {
            code: 'OK',
            message: 'Thank You for your feedback.',
            status: 200
        },
        STATIC_PAGE_CREATED: {
            code: 'OK',
            message: 'Static page added successfully.',
            status: 200
        },
        STATIC_PAGE_UPDATED: {
            code: 'OK',
            message: 'Static page updated successfully.',
            status: 200
        },
        STATIC_PAGE_NOT_FOUND: {
            code: 'OK',
            message: 'Static page record not found.',
            status: 200
        },
        FAQS_CREATED: {
            code: 'OK',
            message: 'Faqs added successfully.',
            status: 200
        },
        FAQS_UPDATED: {
            code: 'OK',
            message: 'Faqs updated successfully.',
            status: 200
        },
        FAQS_NOT_FOUND: {
            code: 'OK',
            message: 'Faqs record not found.',
            status: 200
        },

        DISPUTE_STATUS_UPDATED: {
            code: 'OK',
            message: 'Dispute(s) status update successfully.',
            status: 200
        },
        RIDE_COMPLAINT_CREATED: {
            code: 'OK',
            message: `Complaint created successfully.`,
            status: 200
        },
        RIDE_DISPUTE_CREATED: {
            code: 'OK',
            message: `Ride dispute created successfully.`,
            status: 200
        },
        RIDE_COMPLAINT_DISPUTE_CREATED_CREATE_FAILED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: `Failed to create dispute`,
            status: 401
        },
        RIDE_COMPLAINT_DISPUTE_LIST_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: `Ride complaint dispute list not found.`,
            status: 200
        },
        RIDE_COMPLAINT_DISPUTE_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: `Ride complaint dispute not found.`,
            status: 200
        },
        RIDE_COMPLAINT_DISPUTE_STATUS_UPDATED: {
            code: 'OK',
            message: 'Ride complaint dispute(s) status update successfully.',
            status: 200
        },
        RIDE_DISPUTE_CANCEL_SUCCESS: {
            code: 'OK',
            message: 'Cool, the dispute is now settled.',
            status: 200
        },
        RIDE_COMPLAINT_CANCEL_SUCCESS: {
            code: 'OK',
            message: 'Cool, the complain is now settled.',
            status: 200
        },
        RIDE_DISPUTE_CANCEL_FAILED: {
            code: 'OK',
            message: 'Failed to cancel ride dispute.',
            status: 200
        },
        RIDE_COMPLAINT_CANCEL_FAILED: {
            code: 'OK',
            message: 'Failed to cancel complaint.',
            status: 200
        },
        ZONE_FAILED_CREATED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Failed to create Zone.',
            status: 401
        },
        ZONE_CREATED: {
            code: 'OK',
            message: 'Zone created successfully.',
            status: 200
        },
        ZONE_UPDATED: {
            code: 'OK',
            message: 'Zone updated successfully.',
            status: 200
        },
        ZONE_DELETED: {
            code: 'OK',
            message: 'Zone deleted successfully.',
            status: 200
        },
        ZONE_AND_FARE_MANAGEMENT_CAN_NOT_DELETED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: "ZoneAndFareManagement is booked. Can't delete it.",
            status: 401
        },
        ZONE_RECORD_NOT_FOUND: {
            code: 'OK',
            message: 'Zone record not found.',
            status: 200
        },
        ZONE_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You are not in specified zone.',
            status: 401
        },
        NOT_IN_SPECIFIED_ZONE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You are not in specified zone.',
            status: 401
        },
        CANT_STOP_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't stop ride in this zone.`,
            status: 401
        },
        CANT_STOP_RIDE_OUTSIDE_END_NEST: {
            code: 'OUT_SIDE_NEST',
            message: `You can't end ride here.`,
            status: 401
        },
        RIDE_NOT_STARTED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't stop reserved ride.`,
            status: 401
        },
        RIDE_ALREADY_STOPPED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Ride is already stopped.`,
            status: 401
        },
        RIDE_IS_ALREADY_PAUSED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Ride is already paused.`,
            status: 401
        },
        RIDE_IS_NOT_PAUSED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Ride is not in paused state.`,
            status: 401
        },
        RIDE_IS_NOT_STARTED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Ride is not started yet.`,
            status: 401
        },
        RIDE_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Ride not found.',
            status: 401
        },
        CANT_CANCEL_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Only reserved ride can be cancelled.',
            status: 401
        },
        RIDE_PAYMENT_PENDING: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't book ride, Your last ride payment is pending.`,
            status: 401
        },
        RIDE_ALREADY_PAID: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Payment for this ride is already done.`,
            status: 401
        },
        RIDE_REQUEST_CHARGE_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Payment for your ride request has been failed.',
            status: 401
        },
        RIDE_REQUEST_CHARGE_SUCCESS: {
            code: 'OK',
            message: 'Payment for your ride request has been done.',
            status: 401
        },
        RIDE_REQUEST_CHARGE_PENDING: {
            code: 'OK',
            message: 'Payment for your ride request has been pending.',
            status: 401
        },
        RIDE_RESERVATION_TIME_EXPIRED: {
            code: 'RIDE_RESERVATION_TIME_EXPIRED',
            message: 'Ride reservation time is expired.',
            status: 401
        },
        CANT_ADD_RATING: {
            code: 'CANT_ADD_RATING',
            message: 'Can not add rating for ride.',
            status: 401
        },
        CANT_ADD_REPORT_PROBLEM: {
            code: 'CANT_ADD_REPORT_PROBLEM',
            message: 'Can not add report problem for ride.',
            status: 400
        },
        ROLE_DUPLICATE_TITLE: {
            code: 'ROLE_DUPLICATE_TITLE',
            message: 'User already added!',
            status: 400
        },
        CANT_UNLOCK_VEHICLE: {
            code: 'E_IOT_ERROR',
            message: `Can not unlock vehicle, Please try again.`,
            status: 401
        },
        CANT_LOCK_VEHICLE: {
            code: 'E_IOT_ERROR',
            message: `Can not lock vehicle, Please try again.`,
            status: 401
        },
        PLEASE_CONFIGURE_IMEI: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Please configure imei for scooter.`,
            status: 401
        },
        PROCEDURE_FAILED_CREATED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Procedure create Cancellation Reason.',
            status: 401
        },
        PROCEDURE_CREATED: {
            code: 'OK',
            message: 'Procedure created successfully.',
            status: 200
        },
        PROCEDURE_UPDATED: {
            code: 'OK',
            message: 'Procedure updated successfully.',
            status: 200
        },
        PROCEDURE_DELETED: {
            code: 'OK',
            message: 'Procedure deleted successfully.',
            status: 200
        },
        PROCEDURE_NOT_FOUND: {
            code: 'OK',
            message: 'Procedure record not found.',
            status: 200
        },
        CONTACT_US_CREATED: {
            code: 'OK',
            message: 'Your contact successfully recoded, We will get back you soon.',
            status: 200
        },
        VEHICLE_LOCK_REQUEST_SENT: {
            code: 'OK',
            message: 'Vehicle lock request send successfully.',
            status: 200
        },
        VEHICLE_UNLOCK_REQUEST_SENT: {
            code: 'OK',
            message: 'Vehicle unlock request send successfully.',
            status: 200
        },
        COMMON_CANT_DELETE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Can not delete. Requested entity is parent of some entity(s).',
            status: 422
        },
        CARD_NOT_ADDED: {
            code: 'PRIVATE_RIDE_ERROR',
            message: `Card not added, please add card first.`,
            status: 401
        },
        INVALID_CURRENT_PASSWORD: {
            code: 'E_BAD_REQUEST',
            message: 'Invalid current password.',
            status: 401
        },
        PAYMENT_REQUEST_FAILED: {
            code: 'E_BAD_REQUEST',
            message: `Can't payment now, please try again`,
            status: 401
        },
        PROMO_CODE_EXPIRED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Promo Code expired.',
            status: 422
        },
        PROMO_CODE_LIMIT_REACHED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Maximum limit reached for the Promo Code.`,
            status: 401
        },
        PROMO_CODE_ONLY_FOR_FIRST_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Promo Code is only applicable to first ride.`,
            status: 401
        },
        PROMO_CODE_NOT_APPLIED_BEFORE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Promo Code not applied before.',
            status: 422
        },
        PROMO_CODE_REMOVED: {
            code: 'OK',
            message: 'Promo Code removed.',
            status: 200
        },
        PROMO_CODE_REMOVE_FAILED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Failed to remove Promo Code.',
            status: 401
        },
        SCOOTER_NOT_ACTIVE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Scooter is not available. Please try another scooter.',
            status: 401
        },
        SCOOTER_NOT_CONNECTED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Scooter is not available. Please try another scooter.',
            status: 401
        },
        SCOOTER_NOT_CONNECTED_WHILE_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Vehicle is not connected.',
            status: 401
        },
        SCOOTER_DISCONNECTED_WHILE_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Vehicle is not available. Please try again or book another vehicle.',
            status: 401
        },
        VERSION_ALREADY_EXISTS: {
            code: 'E_DUPLICATE',
            message: 'Version is already exists.',
            status: 200
        },
        VERSION_CREATE_SUCCESS: {
            message: 'Version added successfully.',
            code: 'OK',
            status: 200
        },
        VERSION_APKS_ALREADY_EXISTS: {
            code: 'E_DUPLICATE',
            message: 'Version apks is already exists.',
            status: 200
        },
        VERSION_DEVICES_ALREADY_EXISTS: {
            code: 'E_DUPLICATE',
            message: 'Version device is already exists.',
            status: 200
        },
        VERSION_UPDATE_SUCCESS: {
            code: 'OK',
            message: 'Version updated successfully.',
            status: 200
        },
        VERSION_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'version not found.',
            status: 404
        },
        NOTIFICATION_CLEARED: {
            code: 'OK',
            message: 'Successfully Cleared all the Notification.',
            status: 200
        },
        NOTIFICATION_NOT_CLEARED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Can not able to clear the Notifications.',
            status: 401
        },
        NOTIFICATION_READ: {
            code: 'OK',
            message: 'Successfully read the Notification.',
            status: 200
        },
        NOTIFICATION_NOT_READ: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Can not able to read the Notifications.',
            status: 401
        },
        CANT_START_RIDE_AT_THIS_LOCATION: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Can not start ride at this Location.',
            status: 401
        },
        BICYCLE_ALREADY_UNLOCK: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'bicycle is already unlock',
            status: 401
        },
        CANT_PAUSE_BICYCLE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Can not pause bicycle.',
            status: 401
        },
        LOCK_BICYCLE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Please lock bicycle to stop ride.',
            status: 401
        },
        PROMO_CODE_NOT_FOR_BICYCLE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Promo Code is not applicable to bicycle.',
            status: 401
        },
        PROMO_CODE_NOT_FOR_SCOOTER: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Promo Code is not applicable to scooter.',
            status: 401
        },
        PROMO_CODE_NOT_FOR_BIKE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Promo Code is not applicable to bike.',
            status: 401
        },
        TODO_CREATED: {
            code: 'OK',
            message: 'Todo created successfully.',
            status: 200
        },
        TODO_UPDATED: {
            code: 'OK',
            message: 'Todo updated successfully.',
            status: 200
        },
        TODO_NOT_FOUND: {
            code: 'OK',
            message: 'Todo record not found.',
            status: 200
        },
        TODO_LIST_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Todo not found.',
            status: 404
        },
        TODO_DELETED: {
            code: 'OK',
            message: 'Todo deleted successfully.',
            status: 200
        },
        CANT_RESERVE_RIDE_AT_THIS_LOCATION: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Can not reserve ride at this location.',
            status: 401
        },
        SOMETHING_WENT_WRONG: {
            message: 'Something went wrong.'
        },
        FAILED_TO_UPDATE_MASTER: {
            message: 'Failed to update master.'
        },
        FAILED_TO_UPDATE_ALL_RECORDS: {
            message: 'Failed to update all records'
        },
        NOTIFICATION_SEND_SUCCESSFULLY: {
            message: 'Notification send Successfully'
        },
        ROLES_ASSIGN_SUCCESSFULLY: {
            message: 'Roles assign successfully.'
        },
        FAILED_TO_ASSIGN_ROLES: {
            message: 'Failed to assign roles'
        },
        MIN_FARE_PAYMENT_FAIL: {
            code: 'BASE_PAYMENT_FAILURE',
            message: `Your card-number card is invalid. So you can not proceed this ride.`,
            status: 401
        },
        UPDATE_APP: {
            code: 'E_BAD_REQUEST',
            message: `Please update the app and try to add card.`,
            status: 401
        },
        WALLET_CREDIT_REQUEST_CHARGE_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Credit for your wallet request has been failed.',
            status: 401
        },
        WALLET_CREDIT_REQUEST_CHARGE_SUCCESS: {
            code: 'OK',
            message: 'Credit for your wallet request has been done.',
            status: 201
        },
        WALLET_CREDIT_MINIMUM_AMOUNT_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Credit for your wallet request does not satisfy minimum credit amount.',
            status: 401
        },
        WALLET_CREDIT_MAXIMUM_AMOUNT_FAILED: {
            code: 'E_BAD_REQUEST',
            message: `You have reached the credit limit. You cannot add more funds to the wallet.`,
            status: 401
        },
        SOMETHING_WENT_WRONG: {
            message: 'Something went wrong.'
        },
        FAILED_TO_UPDATE_MASTER: {
            message: 'Failed to update master.'
        },
        FAILED_TO_UPDATE_ALL_RECORDS: {
            message: 'Failed to update all records'
        },
        NOTIFICATION_SEND_SUCCESSFULLY: {
            message: 'Notification send Successfully'
        },
        ROLES_ASSIGN_SUCCESSFULLY: {
            message: 'Roles assign successfully.'
        },
        FAILED_TO_ASSIGN_ROLES: {
            message: 'Failed to assign roles'
        },
        WALLET_NOT_ENABLED: {
            code: 'E_BAD_REQUEST',
            message: 'Wallet is not enabled.',
            status: 401
        },
        VEHICLE_EMPTY_CURRENT_LOCATION: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Unable to find vehicle location.`,
            status: 401
        },
        FAILED_TO_CREATE_MASTER: {
            message: 'Failed to create master.'
        },
        ERROR: {
            message: 'Error.'
        },
        REQUEST_IS_NOT_VALID_TRY_AGAIN: {
            message: 'This request is not valid , Please try again !.'
        },
        SUCCESS: {
            message: 'success'
        },
        FILE_UPLOADED_SUCCESSFULLY: {
            message: ' file uploaded successfully'
        },
        DELETE_SUCCESSFULLY: {
            message: 'deleted successfully.'
        },
        LINK_SHARE_SUCCESSFULLY: {
            message: 'Link Shared successfully.'
        },
        CONFIG_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Configuration not found.',
            status: 200
        },
        CONFIG_UPDATED: {
            code: 'OK',
            message: 'Configuration is successfully updated.',
            status: 200
        },
        DOCUMENT_CREATED: {
            code: 'OK',
            message: 'Document save successfully.',
            status: 200
        },
        DOCUMENT_UPDATED: {
            code: 'OK',
            message: 'Document updated successfully.',
            status: 200
        },
        DOCUMENT_NOT_FOUND: {
            code: 'OK',
            message: 'Document record not found.',
            status: 200
        },
        DOCUMENT_LIST_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Document not found.',
            status: 404
        },
        DOCUMENT_DELETED: {
            code: 'OK',
            message: 'Document deleted successfully.',
            status: 200
        },
        SCOOTER_NOT_AVAILABLE_FOR_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Scooter is not available for ride.',
            status: 401
        },
        EMAIL_VERIFICATION_OTP: {
            code: 'OK',
            message: 'OTP has been sent to your email.',
            status: 200
        },
        LOGIN_OTP_VERIFIED: {
            code: 'OK',
            message: 'Your login otp has been successfully verified.',
            status: 200
        },
        ASSIGN_VEHICLE_SUCCESS: {
            code: 'OK',
            message: 'Vehicles assigned to franchisee successfully.',
            status: 200
        },
        RETAIN_VEHICLE_SUCCESS: {
            code: 'OK',
            message: 'Vehicles retained from franchisee successfully.',
            status: 200
        },
        DOCUMENT_UPLOADED: {
            code: 'E_DUPLICATE',
            message: 'Document already uploaded.',
            status: 200
        },
        DUPLICATE_NUMBER: {
            code: 'E_DUPLICATE',
            message: 'Document number is already exists.',
            status: 200
        },
        STRIPE_BANK_ACCOUNT_SUCCESS: {
            code: 'OK',
            message: "Bank account added successfully.",
            status: 200
        },
        STRIPE_BANK_ACCOUNT_UPDATE_SUCCESS: {
            code: 'OK',
            message: "Bank account update successfully.",
            status: 200
        },
        STRIPE_BANK_ACCOUNT_REMOVED: {
            code: 'OK',
            message: "Bank account removed successfully.",
            status: 200
        },
        STRIPE_BANK_ACCOUNT_DEFAULT_REMOVE: {
            code: 'OK',
            message: "You can not remove default bank account, please add another and set is default before removing this one.",
            status: 200
        },
        STRIPE_BANK_ACCOUNT_DEFAULT: {
            code: 'OK',
            message: "Bank account set as default successfully.",
            status: 200
        },
        STRIPE_BANK_ACCOUNT_NOT_FOUND: {
            code: 'OK',
            message: "Bank account not found.",
            status: 200
        },
        UPDATE_ALL_COMMISSION_SUCCESS: {
            code: 'OK',
            message: "All franchisee's commissions updated successfully.",
            status: 200
        },
        FRANCHISEE_ADD_ONLY_STAFF: {
            code: 'UNPROCESSABLE_ENTITY',
            message: "Franchisee can add only staff.",
            status: 401
        },
        UPDATE_COMMISSION_SUCCESS: {
            code: 'OK',
            message: 'Commission updated successfully.',
            status: 200
        },
        REQUEST_COMMISSION_PAYOUT_SUCCESS: {
            code: 'OK',
            message: 'Commission payout request placed successfully.',
            status: 200
        },
        COMMISSION_PAYOUT_REQUESTS_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Commission payout request not found.',
            status: 401
        },
        FRANCHISEE_ONLY_REQUEST_PAYOUT: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Only franchisee can request for payout.',
            status: 401
        },
        COMMISSION_TRANSFERRED_SUCCESS: {
            code: 'OK',
            message: 'Commission transferred successfully.',
            status: 200
        },
        COMMISSION_PAYOUT_ADD_SUCCESS: {
            code: 'OK',
            message: 'Commission payout added successfully.',
            status: 200
        },
        GET_UNPAID_COMMISSION_SUCCESS: {
            code: 'OK',
            message: 'Getting unpaid commission of franchisee successfully.',
            status: 200
        },
        NOT_ENOUGH_MONEY_TO_WITHDRAW: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Not enough money to make request withdrawal of provided commission',
            status: 401
        },
        GET_FRANCHISEE_COMMISSION_DETAIL: {
            code: 'OK',
            status: 200,
            message: 'Getting commission details of franchisees successfully'
        },
        DISPUTE_PRIORITY_UPDATED: {
            code: 'OK',
            message: 'Dispute(s) priority update successfully.',
            status: 200
        },
        SERVICE_REQUEST_CREATED: {
            code: 'OK',
            message: `Service request created successfully.`,
            status: 200
        },
        EMAIL_SEND_SUCCESS: {
            code: 'OK',
            message: 'Email send successfully.',
            status: 200
        },
        PAYOUT_REQUEST_REJECT_SUCCESS: {
            code: 'OK',
            message: 'Commission Payout request rejected.',
            status: 200
        },
        BANK_ACCOUNT_NUMBER_DUPLICATE: {
            message: 'Bank account number is already exists.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        ROUTING_NUMBER_DUPLICATE: {
            message: 'Routing number is already exists.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        INVALID_PERCENTAGE_VALUE: {
            code: 'E_BAD_REQUEST',
            message: 'Percentage value can not be greater than 100.',
            status: 400
        },
        PENDING_OLDER_WALLET: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't add wallet, Your last wallet payment is pending.`,
            status: 401
        },
        WALLET_CREDIT_REQUEST_REFERENCE_ID: {
            code: 'OK',
            message: 'Credit for your wallet reference id created successfully.',
            status: 201
        },
        WALLET_ALREADY_CREATED: {
            code: 'E_DUPLICATE',
            message: 'Wallet is already added.',
            status: 200
        },
        PAYMENT_SUCCESS: {
            code: 'OK',
            message: 'Payment is success.',
            status: 200
        },
        PAYMENT_FAIL: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Payment is failed.',
            status: 401
        },
        PAYMENT_EXPIRE: {
            code: 'E_BAD_REQUEST',
            message: 'Your transaction has expires.',
            status: 401
        },
        BOOK_PLAN_CREATED: {
            code: 'OK',
            message: 'Plan created successfully.',
            status: 200
        },
        BOOK_PLAN_UPDATED: {
            code: 'OK',
            message: 'Plan updated successfully.',
            status: 200
        },
        BOOK_PLAN_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Plan not found.',
            status: 401
        },
        ALREADY_SUBSCRIBED_TO_ONE_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You have already subscribed to one plan, cannot buy this plan.',
            status: 401
        },
        NOT_ENOUGH_AMOUNT_IN_WALLET: {
            code: 'INSUFFICIENT_BALANCE_IN_WALLET',
            message: 'You do not have enough money in wallet. Please add money to your wallet.',
            status: 401
        },
        BUY_PLAN_FAILED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Failed to buy the plan.',
            status: 401
        },
        CANT_BUY_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot buy plan.',
            status: 401
        },
        PLAN_NOT_ACTIVE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Plan is not active.',
            status: 401
        },
        CANT_PAUSE_BOOK_PLAN_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot pause subscription plan ride.',
            status: 401
        },
        CANT_RESUME_BOOK_PLAN_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot resume subscription plan ride.',
            status: 401
        },
        CANT_CANCEL_NOT_PURCHASED_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot cancel this plan. You have not purchased this plan.',
            status: 401
        },
        CANT_CANCEL_USED_BOOK_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot cancel used plan.',
            status: 401
        },
        CANT_CANCEL_BOOK_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot cancel plan.',
            status: 401
        },
        BUY_PLAN_REQUEST_CHARGE_SUCCESS: {
            code: 'OK',
            message: 'Payment for your plan buy request is successful.',
            status: 401
        },
        BUY_PLAN_REQUEST_CHARGE_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Payment for your plan buy request is failed.',
            status: 401
        },
        PLAN_CANCEL_REFUND_SUCCESS: {
            code: 'OK',
            message: 'Refund for your cancelled plan is successful.',
            status: 401
        },
        PLAN_CANCEL_REFUND_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Refund for your cancelled plan is failed.',
            status: 401
        },
        CANT_UPGRADE_TO_TRIAL_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot upgrade to trial plan.',
            status: 401
        },
        NO_CURRENT_BOOK_PLAN_FOR_UPGRADE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot upgrade as you do not have any plan purchased.',
            status: 401
        },
        CANT_UPGRADE_TO_DIFFERENT_PLAN_LIMIT: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot upgrade to different type of plan limit type.',
            status: 401
        },
        CANT_UPGRADE_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot upgrade plan, you have more time limit than this plan',
            status: 401
        },
        PLAN_UPGRADE_REFUND_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Refund for your plan is failed.',
            status: 401
        },
        PLAN_CANCEL_SUCCESS: {
            code: 'OK',
            message: 'Cancelled of plan is successful.',
            status: 401
        },
        NO_ACTIVE_CURRENT_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You do not have any current plan.',
            status: 401
        },
        ALREADY_USED_ONE_TRIAL_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You have already used one trial plan.',
            status: 401
        },
        CANT_RENEW_TRIAL_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot renew trial plan.',
            status: 401
        },
        PLAN_NOT_RENEWABLE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Plan is not renewable.',
            status: 401
        },
        RENEW_PLAN_REQUEST_CHARGE_SUCCESS: {
            code: 'OK',
            message: 'Payment for your plan renewal request is successful.',
            status: 401
        },
        RENEW_PLAN_REQUEST_CHARGE_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Payment for your plan renewal request is failed.',
            status: 401
        },
        BOOK_PLAN_DELETED: {
            code: 'OK',
            message: 'Plan deleted successfully.',
            status: 200
        },
        CANT_DELETE_RUNNING_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Someone has purchased the plan, you cannot delete it now.',
            status: 401
        },
        NO_CURRENT_BOOK_PLAN_FOR_NEXT_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot buy this plan as you do not have any plan purchased.',
            status: 401
        },
        NO_ACTIVE_NEXT_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You do not have any next plan.',
            status: 401
        },
        CANT_BUY_TRIAL_PLAN_FOR_NEXT_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Cannot buy trial plan as next plan.',
            status: 401
        },
        ALREADY_PURCHASED_NEXT_PLAN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You have already purchased next plan.',
            status: 401
        },
        PAYMENT_ALREADY_EXPIRE: {
            code: 'E_BAD_REQUEST',
            message: 'Your transaction already has expired.',
            status: 401
        },
        UNIQUE_IDENTITY_CODE_REGISTERED: {
            code: 'E_BAD_REQUEST',
            message: 'Unique identity code is already registered.',
            status: 400
        },
        GIVE_UNIQUE_SERIES_CODE: {
            code: 'E_BAD_REQUEST',
            message: 'Please enter unique series code.',
            status: 400
        },
        NEXT_PLAN_TAKEN_AS_CURRENT: {
            code: 'OK',
            message: 'Your Current Plan is updated to your Next Plan.',
            status: 200
        },
        PENDING_TRANSACTION_REQUEST_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Failed to create pending transaction.',
            status: 401
        },
        TRANSACTION_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Transaction not found!',
            status: 422
        },
        NEST_CREATED: {
            code: 'OK',
            message: 'Nest created successfully.',
            status: 200
        },
        NEST_UPDATED: {
            code: 'OK',
            message: 'Nest updated successfully.',
            status: 200
        },
        NEST_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Nest record not found.',
            status: 200
        },
        NEST_DELETED: {
            code: 'OK',
            message: 'Nest deleted successfully.',
            status: 200
        },
        UPDATE_DEFAULT_RENT_SUCCESS: {
            code: 'OK',
            message: "Default Rent updated successfully.",
            status: 200
        },
        INVALID_CHECKSUM: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Invalid checksum.',
            status: 401
        },
        CHECKSUM_VERIFIED: {
            code: 'OK',
            message: 'Checksum is valid.',
            status: 200
        },
        PAYTM_TRANSACTION_FAILED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Transaction failed.',
            status: 422
        },
        PAYTM_TRANSACTION_PENDING: {
            code: 'OK',
            message: 'Transaction pending.',
            status: 200
        },
        USER_LOGIN_FAILED: {
            code: 'E_INTERNAL_SERVER_ERROR',
            message: 'Failed to login user.',
            status: 401
        },
        WALLET_TOP_UPS_INCORRECT: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Wallet TopUps are incorrect!',
            status: 422
        },
        TASK_FORM_SETTING_CREATED: {
            code: "OK",
            message: "Task setting form added successfully.",
            status: 200
        },
        TASK_FORM_SETTING_UPDATED: {
            code: "OK",
            message: "Task setting form updated successfully.",
            status: 200
        },
        TASK_FORM_SETTING_DELETE: {
            code: "OK",
            message: "Task form deleted successfully.",
            status: 200
        },
        TASK_FORM_SETTING_LIST_NOT_FOUND: {
            code: "OK",
            message: "Task form setting List not Found.",
            status: 200
        },
        LEVEL_TASK_FORM_NOT_COMPLETE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: "You can't delete this task setting from. This level task is not completed.",
            status: 401
        },
        TASK_FORM_DUPLICATE: {
            message: 'Task form already exists.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        TASK_CREATED: {
            code: "OK",
            message: "Task added successfully.",
            status: 200
        },
        TASK_UPDATED: {
            code: "OK",
            message: "Task updated successfully.",
            status: 200
        },
        TASK_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Task not found.',
            status: 404
        },
        TASK_DELETED: {
            code: "OK",
            message: "Task deleted successfully.",
            status: 200
        },
        TASK_LIST_NOT_FOUND: {
            code: "OK",
            message: "Task List not Found.",
            status: 200
        },
        FAILED_UPDATE_STATUS: {
            code: "E_INTERNAL_SERVER_ERROR",
            message: "Failed to Update Status.",
            status: 200
        },
        REPORT_FORM_DUPLICATE: {
            message: 'Report form already exists.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        REPORT_FORM_SETTING_CREATED: {
            code: "OK",
            message: "Report setting form added successfully.",
            status: 200
        },
        REPORT_FORM_SETTING_UPDATED: {
            code: "OK",
            message: "Report setting form updated successfully.",
            status: 200
        },
        REPORT_FORM_SETTING_NOT_FOUND: {
            code: "OK",
            message: "Report form not Found.",
            status: 200
        },
        REPORT_FORM_SETTING_DELETE: {
            code: "OK",
            message: "Report form deleted successfully.",
            status: 200
        },
        REPORT_CREATED: {
            code: "OK",
            message: "Report added successfully.",
            status: 200
        },
        REPORT_UPDATED: {
            code: "OK",
            message: "Report updated successfully.",
            status: 200
        },
        REPORT_LIST_NOT_FOUND: {
            code: "OK",
            message: "Report List not Found.",
            status: 200
        },
        REPORT_DUPLICATE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Report form already exists.',
            status: 422
        },
        VEHICLE_VERIFIED: {
            code: "OK",
            message: "Vehicle has been successfully verified.",
            status: 200
        },
        REPORT_FORM_NOT_FOUND: {
            code: 'OK',
            message: 'Report form not found.',
            status: 200
        },
        END_RIDE_IN_NEST: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You can end ride in nest zone only.',
            status: 422
        },
        KYC_VERIFICATION_REQUEST_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'KYC document verification failed!',
            status: 401
        },
        DRIVING_LICENCE_VERIFIED: {
            code: "OK",
            message: "Driving license verified successfully.",
            status: 200
        },
        DRIVING_LICENCE_VERIFIED_FAILED: {
            code: 'E_BAD_REQUEST',
            message: `Can't verify now, please try again`,
            status: 401
        },
        DRIVING_LICENCE_FAILED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'No Details Found. Please check your Driving Licence Number and DOB.',
            status: 401
        },
        DRIVING_LICENCE_ALREADY_VERIFIED: {
            code: 'E_BAD_REQUEST',
            message: 'Driving licence is already verified.',
            status: 401
        },
        DRIVING_LICENCE_FORM_DUPLICATE: {
            code: 'E_DUPLICATE',
            message: 'Driving licence already exists.',
            status: 200
        },
        DRIVING_LICENCE_NUMBER_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Driving licence number not found.',
            status: 401
        },
        DEALER_CODE_FAILED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Invalid Dealer code.',
            status: 401
        },
        PRIVATE_USER_CAN_USE_PROPERTY: {
            code: 'PRIVATE_USER_CAN_USE_PROPERTY',
            message: 'Only Private user can access this property.',
            status: 401
        },
        ASSIGN_VEHICLE_DEALER_SUCCESS: {
            code: 'OK',
            message: 'Vehicles assigned to dealer successfully.',
            status: 200
        },
        ASSIGN_VEHICLE_DEALER_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Failed assign vehicle to a dealer!',
            status: 401
        },
        RETAIN_VEHICLE_DEALER_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Failed retained vehicle to a dealer!',
            status: 401
        },
        RETAIN_VEHICLE_DEALER_SUCCESS: {
            code: 'OK',
            message: 'Vehicles retained from dealer successfully.',
            status: 200
        },
        PAYMENT_DISABLED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `Payment is disabled.`,
            status: 401
        },
        VEHICLE_NOT_AVAILABLE_TO_ASSIGN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Vehicle is not available for assign to nest.',
            status: 401
        },
        ASSIGN_VEHICLE_SUCCESS: {
            code: "OK",
            message: "Vehicle successfully assign to the nest.",
            status: 200
        },
        VEHICLE_NOT_AVAILABLE_TO_RETAIN: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Vehicle is not available for retain from nest.',
            status: 401
        },
        RETAIN_VEHICLE_SUCCESS: {
            code: "OK",
            message: "Vehicle successfully deallocate from the nest.",
            status: 200
        },
        DRIVING_LICENCE_IMAGE_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Unable to verify, Please try again later.',
            status: 401
        },
        DRIVING_LICENCE_NOT_MATCH: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Driving license number and dob are not matched with the driving license image.',
            status: 401
        },
        UPDATE_RENT_SUCCESS: {
            code: 'OK',
            message: 'Rent updated successfully.',
            status: 200
        },
        RENT_PAYMENT_REQUESTS_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Rent Payment request not found.',
            status: 401
        },
        RENT_PAYMENT_TRANSFERRED_SUCCESS: {
            code: 'OK',
            message: 'Rent Payment transferred successfully.',
            status: 200
        },
        RENT_PAYMENT_REJECT_SUCCESS: {
            code: 'OK',
            message: 'Rent Payment request rejected.',
            status: 200
        },
        INVITE_CODE_REGISTERED: {
            code: 'E_BAD_REQUEST',
            message: 'Invite code is already registered.',
            status: 400
        },
        NEST_CAPACITY_OVER: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Nest capacity is over.',
            status: 401
        },
        SELFIE_VERIFICATION_FAILED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'No Details Found. Please upload selfie again.',
            status: 401
        },
        SELFIE_VERIFIED: {
            code: "OK",
            message: "Selfie verified successfully.",
            status: 200
        },
        MILEAGE_UPDATE_SUCCESSFULLY: {
            code: 'OK',
            message: 'Mileage update successfully.',
            status: 200
        },
        MILEAGE_UPDATE_FAILED: {
            code: 'E_BAD_REQUEST',
            message: 'Mileage update failed.',
            status: 401
        },
        SELFIE_ALREADY_VERIFIED: {
            code: 'E_BAD_REQUEST',
            message: 'Selfie already verified.',
            status: 401
        },
        DL_IMAGE_ALREADY_VERIFIED: {
            code: 'E_BAD_REQUEST',
            message: 'Driving license image already verified.',
            status: 401
        },
        DL_NUMBER_ALREADY_VERIFIED: {
            code: 'E_BAD_REQUEST',
            message: 'Driving license number already verified.',
            status: 401
        },
        DUPLICATE_TASK: {
            message: 'Task already exists for this vehicle.',
            code: 'UNPROCESSABLE_ENTITY',
            status: 422
        },
        SEQUENCE_UPDATED: {
            code: "OK",
            message: "Sequence updated successfully.",
            status: 200,
        },
        SEQUENCE_CREATE_FAILED: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Sequence create failed.',
            status: 401
        },
        DAMAGE_REPORT_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Damage reports not found.',
            status: 404
        },
        INVALID_USER_LEVEL: {
            code: 'E_BAD_REQUEST',
            message: 'Invalid user level.',
            status: 401
        },
        CANT_PAUSE_RIDE_IN_NO_PARKING_ZONE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't pause ride in no parking zone.`,
            status: 400
        },
        CANT_STOP_RIDE_IN_NO_PARKING_ZONE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't stop ride in no parking zone.`,
            status: 400
        },
        CANT_PAUSE_RIDE_IN_NON_RIDE_ZONE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't pause ride in non ride zone.`,
            status: 400
        },
        CANT_STOP_RIDE_IN_NON_RIDE_ZONE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: `You can't stop ride in non ride zone.`,
            status: 400
        },
        NEST_INTERSECT: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Boundaries of 2 or more Zones should not intersect each other.',
            status: 401
        },
        ZONE_INTERSECT: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Boundaries of 2 or more Geo-Fences should not intersect each other.',
            status: 401
        },
        NEST_OUT_OF_ZONE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Boundaries of a Zone should not intersect a Geo-Fence.',
            status: 401
        },
        ZONE_NOT_CONTAINS_ALL_NEST: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'There seems to be a zone outside the updated Geo-fence. Please remove the zone before updating the Geo-Fence.',
            status: 401
        },
        NOTIFICATION_LIST_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Notifications not found.',
            status: 404
        },
        BOOKING_PASS_CREATED: {
            code: 'OK',
            message: 'Plan created successfully.',
            status: 200
        },
        BOOKING_PASS_UPDATED: {
            code: 'OK',
            message: 'Plan updated successfully.',
            status: 200
        },
        BOOKING_PASS_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Plan not found.',
            status: 401
        },
        VEHICLE_NOT_AVAILABLE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: "This %@ is not available for a ride, Please use another %@.",
            status: 401
        },
        BOOT_OPEN_COMMAND_SEND: {
            code: 'OK',
            message: 'Boot Should Open.',
            status: 200
        },
        CAPTURE_VEHICLE: {
            code: "OK",
            message: "Capture vehicle successfully.",
            status: 200
        },
        CAPTURE_VEHICLE_FAIL: {
            code: "OK",
            message: "Fail to capture vehicle.",
            status: 200
        },
        TASK_ALREADY_CAPTURE: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Task capture by other feeder.",
            status: 401
        },
        ALARM_COMMAND_SEND: {
            code: 'OK',
            message: 'Alarm Should Ring.',
            status: 200
        },
        CLAIM_NEST_SUCCESS: {
            code: "OK",
            message: "Claim nest successfully.",
            status: 200
        },
        CLAIM_NEST_FAIL: {
            code: "OK",
            message: "Claim nest Fail.",
            status: 200
        },
        RELEASE_MORE_FALCON: {
            code: "OK",
            message: "Do you want to release more falcons?",
            status: 200
        },
        RELEASE_FALCON_SUCCESS: {
            code: "OK",
            message: "Your all falcon release successfully.",
            status: 200
        },
        RELEASE_FALCON_FAIL: {
            code: "OK",
            message: "Fail to release falcon.",
            status: 200
        },
        TASK_ALREADY_COMPLETE: {
            code: "OK",
            message: "Task already complete.",
            status: 200
        },
        RELEASE_NEST_SUCCESS: {
            code: "OK",
            message: "Release nest successfully.",
            status: 200
        },
        RELEASE_NEST_FAIL: {
            code: "OK",
            message: "Release nest Fail.",
            status: 200
        },
        RELEASE_VEHICLE_RIDER_NEST_FAIL: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Please release the falcon in the Repair Nest.",
            status: 401
        },
        RELEASE_VEHICLE_REPAIR_NEST_FAIL: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Please release the falcon in the Rider Nest.",
            status: 401
        },
        NEST_CAPACITY_OVER: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Nest capacity is over, Please claim another nest.",
            status: 401
        },
        NEST_ALREADY_CLAIMED: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Nest is already claimed, Please claim another nest.",
            status: 401
        },
        USER_ALREADY_CLAIM_NEST: {
            code: "UNPROCESSABLE_ENTITY",
            message: "You already claimed one nest. If you want to claim another nest then please cancel the claimed nest.",
            status: 401
        },
        UNAUTHORIZED_NEST: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Please select correct nest.",
            status: 401
        },
        CANCEL_CLAIM_NEST_SUCCESS: {
            code: "OK",
            message: "Cancel claim nest successfully",
            status: 200
        },
        CANCEL_CLAIM_NEST_FAIL: {
            code: "OK",
            message: "Cancel claim nest fail!",
            status: 200
        },
        TASK_CANCEL: {
            code: "OK",
            message: "Task cancelled successfully.",
            status: 200
        },
        TASK_CANCEL_FAIL: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Task cancel failed!",
            status: 422
        },
        CLAIM_REPAIR_NEST: {
            code: "UNPROCESSABLE_ENTITY",
            message: "You select wrong nest, Please claim repair nest.",
            status: 401
        },
        CLAIM_RIDER_NEST: {
            code: "UNPROCESSABLE_ENTITY",
            message: "You select wrong nest, Please claim rider nest.",
            status: 401
        },
        CLAIM_NEST_TASK_NOT_FOUND: {
            code: "UNPROCESSABLE_ENTITY",
            message: "Task not found, Please capture falcon then try to claim nest.",
            status: 401
        },
        EXCEEDED_MAX_PAUSE_RIDE_LIMIT: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You exceeded the maximum pause ride limit.',
            status: 400
        },
        NO_WALLET_PROMO_CODE_ON_RIDE: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'This promo code cannot be applied while taking a Ride.',
            status: 401
        },
        RIDE_PROMO_CODE_ONLY: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'This promo code can be applied while taking a Ride.',
            status: 401
        },
        REFERRAL_SETTING_CREATED: {
            code: 'OK',
            message: 'Referral Setting created successfully.',
            status: 200
        },
        REFERRAL_SETTING_UPDATED: {
            code: 'OK',
            message: 'Referral Setting updated successfully.',
            status: 200
        },
        REFERRAL_SETTING_NOT_FOUND: {
            code: 'OK',
            message: 'Referral Setting record not found.',
            status: 200
        },
        REFERRAL_SETTING_LIST_NOT_FOUND: {
            code: 'E_NOT_FOUND',
            message: 'Referral Setting not found.',
            status: 404
        },
        REFERRAL_SETTING_DELETED: {
            code: 'OK',
            message: 'Referral Setting deleted successfully.',
            status: 200
        },
        ALREADY_SET_DEFAULT_REFERRAL_SETTING: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Already set default referral setting.',
            status: 401
        },
        REFERRAL_CODE_FAIL: {
            code: "UNPROCESSABLE_ENTITY",
            message: "You enter wrong referral code.",
            status: 401
        },
        REFERRAL_CODE_CREATE_FAILED: {
            code: 'CREATE_FAILED',
            message: 'The request has not been fulfilled, Please try again',
            status: 500
        },
        RIDE_LOCATION_DATA_NOT_FOUND: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Ride location data not found.',
            status: 401
        },
        CANT_START_RIDE_AT_NO_RIDE_AREA: {
            code: 'UNPROCESSABLE_ENTITY',
            message: 'You are in a No Ride Area, You can not start ride from here.',
            status: 401
        },
        PAYMENT_ALREADY_SUCCESS: {
            code: 'E_BAD_REQUEST',
            message: `Transaction already has been credited to wallet.`,
            status: 401
        },
        OPERATIONAL_CREATED: {
            code: 'OK',
            message: 'Operation hours added successfully.',
            status: 200
        },
        OPERATIONAL_UPDATED: {
            code: 'OK',
            message: 'Operation hours updated successfully.',
            status: 200
        },

        OPERATIONAL_RECORD_NOT_FOUND: {
            code: 'OK',
            message: 'Operation hours record not found.',
            status: 200
        },

        OPERATIONAL_HOURS_CLOSED :{
            code: 'UNPROCESSABLE_ENTITY',
            message: 'We have closed operations.',
            status: 200 
        },

        BOOKING_PASS_OPERATIONAL_HOURS_CLOSE :{
            code: 'UNPROCESSABLE_ENTITY',
            message: 'Please buy booking pass in operational hours.',
            status: 200   
        },
        REFERENCE_ID_NOT_FOUND: {
            code: 'E_BAD_REQUEST',
            message: `Reference Id required`,
            status: 401
        },
    }
};
