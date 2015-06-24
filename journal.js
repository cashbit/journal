/*
*   Journal
*
*
*
* */

var journalCollection = new Meteor.Collection("cashbitjournal") ;

var __config = {} ;
__config.from = __config.from || "journal@localhost" ;

__journal = function(){
    /*
    * {
    *
    *   emailnotififications: {
    *       from: "hostmaster@siadmigo.com",
    *       dailyto: ["carlo.cassinari@gmail.com"],
    *       alarmto: ["carlo.cassinari@gmail.com"]
    *   }
    * }
    *
    * */



    var world = function () {
        console.log('World!');
    }

    var notifyDaily = function () {
        console.log('My Birth Day!');
        var events = journalCollection.find({notifieddaily:false}).fetch();
        events.forEach(function(event){
            journalCollection.update(event._id,{$set:{notifieddaily:true}}) ;
        }) ;
        if (events.length > 0){
            var body = EJSON.stringify(events)
        } else {
            var body = "No events today !!!" ;
        }
        if (__config.emailnotifications){
            if (__config.emailnotifications.dailyto){
                __config.emailnotifications.dailyto.forEach(function(recipient){
                    Email.send({
                        from: __config.emailnotifications.from,
                        to : recipient,
                        subject: "Journal daily digest",
                        text: body
                    }) ;
                }) ;
            }
        }
    } ;

    var notifyAlarm = function () {
        console.log('My Birth Day!');
        var events = journalCollection.find({notifiedalarm:false}).fetch();
        events.forEach(function(event){
            journalCollection.update(event._id,{$set:{notifiedalarm:true}}) ;
        }) ;
        if (events.length > 0){
            var body = EJSON.stringify(events)
        } else {
            var body = "No events today !!!" ;
        }
        if (__config.emailnotifications){
            if (__config.emailnotifications.alarmto){
                __config.emailnotifications.alarmto.forEach(function(recipient){
                    Email.send({
                        from: __config.emailnotifications.from,
                        to : recipient,
                        subject: "Journal daily digest",
                        text: body
                    }) ;
                }) ;
            }
        }
    } ;

    var cron = new Meteor.Cron( {
        events:{
            "* * * * *"  : world,
            "0 * * * *" : notifyDaily
        }
    });

    Meteor.setInterval(notifyAlarm,10000) ;


    return {
        config: function(config){
            __config = config ;
        },
        writeError: function(context,payload){
            return this.write("error",context,payload) ;
        },
        write: function(type,context,payload){
            return journalCollection.insert({
                type: type,
                context: context,
                payload: payload,
                createdAt : new Date(),
                notifiedalarm: false,
                notifieddaily: false
            });
        },
        fetch: function(){
            return journalCollection.find({$ne:{readed:true}}).observe() ;
        },
        readed: function(id){
            return journalCollection.update(
                id,
                {$set:{
                    readed: true,
                    readedOn: new Date()
                }}
            );
        }
    }

}

journal = new __journal() ;

journal.write("startup","journal","") ;