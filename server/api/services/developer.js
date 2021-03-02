const UtilService = require('./util');
module.exports = {

    async deleteUsersAllData(filter, isDeleteAndUpdateData, loginUserId,remark) {
        try {
            let allData = {};
            if (_.isEmpty(filter)) {
                return allData;
            }

            let userList = await User.find(filter);
            console.log('user', userList.length);

            let userIds = _.map(userList, 'id');

            let notifications = [];
            let notificationList = [];
            let planInvoices = [];
            let reports = [];
            let tasks = [];

            if (userIds && userIds.length) {
                allData = await this.deleteRidesAllData({ userId: userIds }, isDeleteAndUpdateData, loginUserId, remark, true, userIds);

                notifications = await Notification.find({ userId: userIds });
                planInvoices = await PlanInvoice.find({ userId: userIds });
                reports = await Report.find({ userId: userIds });

                let reportIds = _.map(reports, 'id');
                tasks = await Task.find({ reportId: reportIds });
                notificationList = await NotificationList.find({ userId: userIds });

                allData.notificationsIds = _.map(notifications, 'id');
                allData.planInvoicesIds = _.map(planInvoices, 'id');
                allData.reportIds = _.clone(reportIds);
                allData.taskIds = _.map(tasks, 'id');
                allData.notificationListIds = _.map(notificationList, 'id');

                if (isDeleteAndUpdateData) {
                    if (allData.notificationsIds && allData.notificationsIds.length) {
                        await Notification.destroy({ id: allData.notificationsIds });
                    }

                    if (allData.notificationListIds && allData.notificationListIds.length) {
                        await NotificationList.destroy({ id: allData.notificationListIds });
                    }

                    if (allData.planInvoicesIds && allData.planInvoicesIds.length) {
                        planInvoices = await this.addDeletedByKey(planInvoices, loginUserId,remark);
                        await PlanInvoice.destroy({ id: allData.planInvoicesIds });
                        await DeletedPlanInvoice.createEach(planInvoices);
                    }

                    if (allData.reportIds && allData.reportIds.length) {
                        reports = await this.addDeletedByKey(reports, loginUserId,remark);
                        await Report.destroy({ id: allData.reportIds });
                        await DeletedReport.createEach(reports);
                    }

                    if (allData.taskIds && allData.taskIds.length) {
                        tasks = await this.addDeletedByKey(tasks, loginUserId,remark);
                        await Task.destroy({ id: allData.taskIds });
                        await DeletedTask.createEach(tasks);
                    }

                    userList = await this.addDeletedByKey(userList, loginUserId,remark);
                    await User.destroy({ id: userIds });
                    await DeletedUser.createEach(userList);
                }
            }
            return allData;

        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    },

    async deleteRidesAllData(filter, isDeleteAndUpdateData, loginUserId,remark, isUserDelete = false, userIds = []) {
        try {
            let allData = {};
            if (_.isEmpty(filter)) {
                return allData;
            }

            let rideBookings = await RideBooking.find(filter);

            console.log('rideBooking', rideBookings.length);

            let rideIds = [];
            let rideNumbers = [];
            let nestTracks = [];
            let ratings = [];
            let rideComplaintDisputes = [];
            let rideLocationTracks = [];

            rideIds = _.map(rideBookings, 'id');
            rideNumbers = _.map(rideBookings, 'rideNumber');
            let filterForTransaction = {};
            if (userIds.length > 0 && rideIds.length > 0) {
                filterForTransaction = {
                    or: [
                        { transactionBy: userIds },
                        { rideId: rideIds }
                    ]
                }
            } else {
                if (userIds.length > 0) {
                    filterForTransaction.transactionBy = userIds;
                }

                if (rideIds.length > 0) {
                    filterForTransaction.rideId = rideIds;
                }
            }
            allData = await this.deleteTransactionAllData(filterForTransaction, isDeleteAndUpdateData, loginUserId,  remark ,isUserDelete,true);
            
            if (rideIds && rideIds.length) {
                nestTracks = await NestTrack.find({ rideId: rideIds });
                ratings = await Rating.find({ rideId: rideIds }).populate('rideId', { select: ['vehicleId'] });
                rideComplaintDisputes = await RideComplaintDispute.find({ rideId: rideIds });
                rideLocationTracks = await RideLocationTrack.find({ rideId: rideIds });

                allData.rideIds = rideIds;
                allData.nestTrackIds = _.map(nestTracks, 'id');
                allData.ratingIds = _.map(ratings, 'id');
                allData.rideComplaintDisputeIds = _.map(rideComplaintDisputes, 'id');
                allData.rideLocationTracksIds = _.map(rideLocationTracks, 'id');
                allData.rideNumbers = rideNumbers;

                if (isDeleteAndUpdateData) {

                    if (allData.nestTrackIds && allData.nestTrackIds.length) {
                        nestTracks = await this.addDeletedByKey(nestTracks, loginUserId,remark);
                        await NestTrack.destroy({ id: allData.nestTrackIds });
                        await DeletedNestTrack.createEach(nestTracks);
                    }

                    if (allData.ratingIds && allData.ratingIds.length) {
                        ratings = await this.addDeletedByKey(ratings, loginUserId,remark);
                        await Rating.destroy({ id: allData.ratingIds });
                        await DeletedRating.createEach(ratings);
                        await this.updateRatingSummary(ratings, isDeleteAndUpdateData);
                    }

                    if (allData.rideComplaintDisputeIds && allData.rideComplaintDisputeIds.length) {
                        rideComplaintDisputes = await this.addDeletedByKey(rideComplaintDisputes, loginUserId,remark);
                        await RideComplaintDispute.destroy({ id: allData.rideComplaintDisputeIds });
                        await DeletedRideComplaintDispute.createEach(rideComplaintDisputes);
                    }

                    if (allData.rideLocationTracksIds && allData.rideLocationTracksIds.length) {
                        rideLocationTracks = await this.addDeletedByKey(rideLocationTracks, loginUserId,remark);
                        await RideLocationTrack.destroy({ id: allData.rideLocationTracksIds });
                        await DeletedRideLocationTrack.createEach(rideLocationTracks);
                    }

                    if (allData.rideIds && allData.rideIds.length) {
                        rideBookings = await this.addDeletedByKey(rideBookings, loginUserId,remark);
                        await RideBooking.destroy({ id: allData.rideIds });
                        await DeletedRideBooking.createEach(rideBookings);
                    }
                }
            }

            return allData;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    },

    async deleteTransactionAllData(filter, isDeleteAndUpdateData, loginUserId, remark, isUserDelete = false,isRideDelete= false) {
        try {
            let allData = {};
            if (_.isEmpty(filter)) {
                return allData;
            }
            let transactions = await TransactionLog.find(filter).populate('rideId', { select: ['id', "rideNumber"] });
            console.log('transactions', transactions.length);
            let users = {};
            if (!isDeleteAndUpdateData) {
                let userIds = _.map(transactions, 'transactionBy');
                let userData = await User.find({ id: userIds });
                for (let user of userData) {
                    users[user.id] = user;
                }
            }

            let data = [];
            let tIds = [];
            let uIds = [];
            let newWalletAmount = 0;
            for (let transaction of transactions) {
                let user;
                if (isDeleteAndUpdateData) {
                    user = await User.findOne({ id: transaction.transactionBy });
                } else {
                    user = users[transaction.transactionBy];
                }

                if (transaction.status === sails.config.STRIPE.STATUS.succeeded) {
                    if (transaction.type === sails.config.STRIPE.TRANSACTION_TYPE.DEBIT) {
                        newWalletAmount = user.walletAmount + transaction.amount;
                    } else {
                        newWalletAmount = user.walletAmount - transaction.amount;
                    }
                    newWalletAmount = UtilService.getFloat(newWalletAmount);
                }

                let mobile = '-';
                let email = '-';
                if (user && user.mobiles) {
                    let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
                    let countryCode = UtilService.getPrimaryValue(user.mobiles, 'countryCode');
                    mobile = countryCode + ' ' + primaryMobile;
                }
                if (user && user.emails) {
                    let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                    email = primaryEmail;
                }


                // destroy bonus transaction
                let bonusTransactionIds = [];
                let bonusAmount = 0;
                let bonusTransactions = await TransactionLog.find({ bonusTransactionId: transaction.id });
                if (bonusTransactions && bonusTransactions.length) {
                    bonusTransactionIds = _.map(bonusTransactions, 'id');
                    for (let bonusTransaction of bonusTransactions) {
                        bonusAmount = bonusAmount + bonusTransaction.amount;
                        if (bonusTransaction.status === sails.config.STRIPE.STATUS.succeeded) {
                            if (bonusTransaction.type === sails.config.STRIPE.TRANSACTION_TYPE.DEBIT) {
                                newWalletAmount = newWalletAmount + bonusTransaction.amount;
                            } else {
                                newWalletAmount = newWalletAmount - bonusTransaction.amount;
                            }
                            newWalletAmount = UtilService.getFloat(newWalletAmount);
                        }
                    }
                }

                let d = {
                    rideId: transaction.rideId ? transaction.rideId.id : '',
                    rideNumber: transaction.rideId ? transaction.rideId.rideNumber : '',
                    userId: transaction.transactionBy,
                    transactionId: transaction.id,
                    remark: transaction.remark,
                    name: user.name ? user.name : `${user.firstName} ${user.lastName}`,
                    email: email,
                    mobile: mobile,
                    currentWalletAmount: user.walletAmount,
                    transactionAmount: transaction.amount,
                    newWalletAmount: newWalletAmount,
                    paymentTransactionId: transaction.paymentTransactionId,
                    promoCodeName: transaction.promoCodeData ? transaction.promoCodeData.name : '',
                    promoCode: transaction.promoCodeData ? transaction.promoCodeData.code : '',
                    bonusTransactionId: bonusTransactionIds && bonusTransactionIds.length ? _.first(bonusTransactionIds) : '',
                    bonusAmount: bonusAmount
                };

                 // Transaction of booking pass purchase then delete there all Rides 
                 if(!isRideDelete && transaction.planInvoiceId && transaction.remark === 'Transaction on the completion of buying the plan'){
                    let rideData = await RideBooking.find({where:{planInvoiceId:transaction.planInvoiceId},select:['id']}) ;
                    if(rideData && rideData.length){
                       let rideIds =  _.map(rideData,'id'); 
                       console.log('rideIds',rideIds);
                       await this.deleteRidesAllData({ id: rideIds }, isDeleteAndUpdateData, loginUserId, remark);
                    }  
                }

                // if transaction is referral benefit then delete it;
                if(transaction.remark === 'Add referral bonus to wallet'){
                    let referralBenefits = await ReferralBenefit.find({or:[{invitedUserId:transaction.transactionBy},{referralUserId:transaction.transactionBy}]}) ;
                    if(referralBenefits && referralBenefits.length){
                       let referralBenefitIds =  _.map(referralBenefits,'id'); 
                       console.log('referralBenefitIds',referralBenefitIds);
                       if (isDeleteAndUpdateData) {
                        referralBenefits = await this.addDeletedByKey(referralBenefits, loginUserId,remark);
                        await DeletedReferralBenefit.createEach(referralBenefits);
                        await ReferralBenefit.destroy({id:referralBenefitIds});
                       }        
                    }    
                }

                if (isDeleteAndUpdateData) {
                     // Transaction for extra taken time from the plan then update ride
                     if(!isRideDelete && transaction.rideId && transaction.rideId.id &&transaction.planInvoiceId && transaction.remark === 'Transaction for extra taken time from the plan'){
                        let rideData = await RideBooking.findOne({id:transaction.rideId.id}) ;
                        if(rideData && rideData.id){
                            let fareSummary = _.clone(rideData.fareSummary);
                            fareSummary.total = 0;
                            fareSummary.subTotal = 0;
                            await RideBooking.update({id: rideData.id},{totalFare: 0,fareSummary: fareSummary});
                        }
                    } 

                    await TransactionLog.destroy({ id: transaction.id });

                    let deletedRecord = _.clone(transaction);
                    deletedRecord.deletedBy = loginUserId;
                    deletedRecord.userRemark = remark;
                    await DeletedTransactionLog.create(deletedRecord);

                    if (bonusTransactionIds && bonusTransactionIds.length) {
                        bonusTransactions = await this.addDeletedByKey(bonusTransactions, loginUserId,remark);
                        await TransactionLog.destroy({ id: bonusTransactionIds });
                        await DeletedTransactionLog.createEach(bonusTransactions);
                    }

                   
                    if (!isUserDelete) {
                        await User.update({ id: user.id }, { walletAmount: newWalletAmount });
                    }

                }else {
                    users[transaction.transactionBy].walletAmount = newWalletAmount;
                }

                data.push(d);
                tIds.push(transaction.id);
                uIds.push(user.id);
            }

            allData.data = data;
            allData.tIds = tIds;
            allData.uIds = _.uniq(uIds);

            return allData;

        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    },

    async deleteVehicleAllData(filter, isDeleteAndUpdateData, loginUserId, remark, isUserDelete = false){
        try {
            let allData = {};
            if (_.isEmpty(filter)) {
                return allData;
            }

            let vehicleList = await Vehicle.find(filter);
            console.log('vehicle', vehicleList.length);

            let vehicleIds = _.map(vehicleList, 'id');

            let notifications = [];
            let reports = [];
            let tasks = [];

            if (vehicleList && vehicleList.length) {
                allData = await this.deleteRidesAllData({ vehicleId: vehicleIds }, isDeleteAndUpdateData, loginUserId, remark);

                notifications = await Notification.find({ vehicleId: vehicleIds });
              
                reports = await Report.find({ vehicleId: vehicleIds });

                let reportIds = _.map(reports, 'id');
                tasks = await Task.find({ reportId: reportIds });
              
                allData.notificationsIds = _.map(notifications, 'id');
                allData.reportIds = _.clone(reportIds);
                allData.taskIds = _.map(tasks, 'id');
                allData.vehicleIds = _.map(vehicleIds);
               

                if (isDeleteAndUpdateData) {
                    if (allData.notificationsIds && allData.notificationsIds.length) {
                        await Notification.destroy({ id: allData.notificationsIds });
                    }

                    if (allData.reportIds && allData.reportIds.length) {
                        reports = await this.addDeletedByKey(reports, loginUserId,remark);
                        await Report.destroy({ id: allData.reportIds });
                        await DeletedReport.createEach(reports);
                    }

                    if (allData.taskIds && allData.taskIds.length) {
                        tasks = await this.addDeletedByKey(tasks, loginUserId,remark);
                        await Task.destroy({ id: allData.taskIds });
                        await DeletedTask.createEach(tasks);
                    }

                    vehicleList = await this.addDeletedByKey(vehicleList, loginUserId,remark);
                    await Vehicle.destroy({ id: vehicleIds });
                    await DeletedVehicle.createEach(vehicleList);
                }
            }
            return allData;

        } catch (e) {
            console.log(e);
            throw new Error(e);
        }

    },

    async addDeletedByKey(dataArray, loginUserId,remark) {
        for (let data of dataArray) {
            data.deletedBy = loginUserId;
            data.userRemark = remark ? remark : '';
        }
        return dataArray;
    },

    async updateRatingSummary(dataArray, isDeleteAndUpdateData) {

        for (let data of dataArray) {
            if (data.rideId && data.rideId.vehicleId) {
                let ratingSummary = await RatingSummary.find({ "_id.referenceId": data.rideId.vehicleId, "_id.ratingType": data.ratingType }).meta({ enableExperimentalDeepTargets: true });
                if (ratingSummary && ratingSummary.length) {
                    ratingSummary = _.first(ratingSummary);

                    ratingSummary.value.totalUserCount = ratingSummary.value.totalUserCount - 1;
                    ratingSummary.value.totalRating = ratingSummary.value.totalRating - data.rating;
                    ratingSummary.value.avgRating = ratingSummary.value.totalRating / ratingSummary.value.totalUserCount;

                    ratingSummary.value.userCountByRating[data.rating] = ratingSummary.value.userCountByRating[data.rating] - 1;

                    if (isDeleteAndUpdateData) {
                        let db = RatingSummary.getDatastore().manager;
                        let collection = db.collection(RatingSummary.tableName);
                        await collection.update({ "_id.referenceId": data.rideId.vehicleId, "_id.ratingType": data.ratingType }, ratingSummary);
                    }
                }
            }

        }
        return dataArray;
    }

}