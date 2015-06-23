/*
*   Journal
*
*
*
* */

var journalCollection = new Meteor.Collection("cashbitjournal") ;

journal = {
    writeError: function(context,payload){
      return this.write("error",context,payload) ;
    },
    write: function(type,context,payload){
          return journalCollection.insert({
              type: type,
              context: context,
              payload: payload,
              createdAt : new Date()
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