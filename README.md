# Monster Hearts 2 Narrator

A Discord bot for playing Monster Hearts 2.

## Description

An in-depth paragraph about your project and overview of use.

## Getting Started

### Installing

Invite Bot to your server using [this link](https://discord.com/oauth2/authorize?client_id=1426396377411354674)

### Executing program

To run bot on local 
```node index.js```

## Bot Commands

* !register
    * Formatted ```!register name hot cold volatile dark```
    * Ex. ```!register Sabrina 1 0 -1 2```
    * Registers player data in Firebase
* !roll
    * Formatted ```!roll skill```
    * Ex. ```!roll dark``` (Available options: hot, cold, volatile, & dark)
    * Rolls 2d6 then adds skill modifier of user
    * Note: will not work unless user is registered first

### Planned Commands

* !strings
    * list all the strings registered to a specific user
* !addString
    * add a string for specific user
    * to include the character said string is on and description
* !useString
    * spend a string and delete from Firebase

## Authors

[@Sag3Advice](https://github.com/Sag3Advic3)

## Version History

* 0.2
    * Various bug fixes and optimizations
    * See [commit change]() or See [release history]()
* 0.1
    * Initial Release

## License

This project is licensed under the [NAME HERE] License - see the LICENSE.md file for details

## Acknowledgments

Based on the ttrpg Monster Hearts 2 by Avery Alder
* [Monster Hearts 2](https://buriedwithoutceremony.com/monsterhearts)