export const EMPTY_INFO = {
  'name': 'x',
  'levels': [],
  'estimatedTime': 1
};

export const GAME_INFORMATION = {
  'name': 'CTF-1: No Secure Connection',
  'levels': [
    {
      'type': 'INFO_LEVEL',
      'name': 'Base info for No Secure Connection',
      'number': 1,
      'estimatedTime': 200,
      'points': 0,
      'id': 32
    },
    {
      'type': 'INFO_LEVEL',
      'name': 'Network Error - Info',
      'number': 2,
      'estimatedTime': 200,
      'points': 0,
      'id': 10
    },
    {
      'type': 'GAME_LEVEL',
      'name': 'Network Error',
      'number': 3,
      'estimatedTime': 1000,
      'points': 20,
      'id': 11,
      'hints': [
        {
          'points': 10,
          'number': 1,
          'id': 3
        }
      ],
      'gameLevelNumber': 1
    },
    {
      'type': 'INFO_LEVEL',
      'name': 'New Secure Connection - Info',
      'number': 4,
      'estimatedTime': 200,
      'points': 0,
      'id': 12
    },
    {
      'type': 'GAME_LEVEL',
      'name': 'New Secure Connection',
      'number': 5,
      'estimatedTime': 1000,
      'points': 20,
      'id': 13,
      'hints': [
        {
          'points': 10,
          'number': 1,
          'id': 4
        }
      ],
      'gameLevelNumber': 2
    },
    {
      'type': 'INFO_LEVEL',
      'name': 'Unavailable Document - Info',
      'number': 6,
      'estimatedTime': 200,
      'points': 0,
      'id': 14
    },
    {
      'type': 'GAME_LEVEL',
      'name': 'Unavailable Document',
      'number': 7,
      'estimatedTime': 1000,
      'points': 35,
      'id': 15,
      'hints': [
        {
          'points': 15,
          'number': 1,
          'id': 5
        },
        {
          'points': 5,
          'number': 2,
          'id': 6
        }
      ],
      'gameLevelNumber': 3
    },
    {
      'type': 'INFO_LEVEL',
      'name': 'Disable Passwords - Info',
      'number': 8,
      'estimatedTime': 200,
      'points': 0,
      'id': 16
    },
    {
      'type': 'GAME_LEVEL',
      'name': 'Disable Passwords',
      'number': 9,
      'estimatedTime': 1000,
      'points': 25,
      'id': 17,
      'hints': [
        {
          'points': 10,
          'number': 1,
          'id': 7
        }
      ],
      'gameLevelNumber': 4
    }
  ],
  'estimatedTime': 8100
};

