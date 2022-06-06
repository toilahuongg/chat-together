export const GROUPS_QUERY = [
  {
    '$lookup': {
      'from': 'messages',
      'localField': '_id',
      'foreignField': 'roomID',
      'as': 'message'
    }
  }, {
    '$unwind': {
      'path': '$message',
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$group': {
      '_id': '$_id',
      'name': {
        '$first': '$name'
      },
      'message': {
        '$last': '$message'
      },
      'isGroup': {
        '$first': '$isGroup'
      },
      'userIDs': {
        '$first': '$userIDs'
      },
      'ownerID': {
        '$first': '$ownerID'
      },
      'avatar': {
        '$first': '$avatar'
      },
      'settings': {
        '$first': '$settings'
      },
      'infoUsers': {
        '$first': '$infoUsers'
      },
      'createdAt': {
        '$first': '$createdAt'
      }
    }
  },
  {
    '$lookup': {
      'from': 'users',
      'localField': 'message.sender',
      'foreignField': '_id',
      'as': 'user'
    }
  }, {
    '$unwind': {
      'path': '$user',
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$group': {
      '_id': '$_id',
      'name': {
        '$first': '$name'
      },
      'message': {
        '$last': '$message'
      },
      'user': {
        '$first': '$user'
      },
      'isGroup': {
        '$first': '$isGroup'
      },
      'userIDs': {
        '$first': '$userIDs'
      },
      'ownerID': {
        '$first': '$ownerID'
      },
      'avatar': {
        '$first': '$avatar'
      },
      'settings': {
        '$first': '$settings'
      },
      'infoUsers': {
        '$first': '$infoUsers'
      },
      'createdAt': {
        '$first': '$createdAt'
      }
    }
  }, {
    '$project': {
      'name': 1,
      'infoUsers': 1,
      'userIDs': 1,
      'message': 1,
      'user': {
        _id: 1,
        username: 1,
        fullname: 1
      },
      'ownerID': 1,
      'isGroup': 1,
      'avatar': 1,
      'settings': 1,
      'createdAt': {
        '$cond': {
          'if': {
            '$eq': [
              '$message', null
            ]
          },
          'then': '$createdAt',
          'else': '$message.createdAt'
        }
      }
    }
  }
]