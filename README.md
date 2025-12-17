# Monster Hearts 2 Narrator

A Discord bot for playing Monster Hearts 2.

## Description

This is a bot to be hosted on a Discord server to aide in the gameplay of the ttrpg game, Monster Hearts 2. Below are the commands that this bot is capable of performing.

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
* !strings
    * list all the strings registered to a specific user
* !addString
    * Formatted ```!addString [name] [description]```
    * add a string for specific user
* !useString
    * Formatted ```!useString id```
    * spend a string and delete from Firebase

### Planned Commands

N/A

## Authors

[@Sag3Advice](https://github.com/Sag3Advic3)

## Version History

* 0.2
    * Various bug fixes and optimizations
    * See [commit change]() or See [release history]()
* 0.1
    * Initial Release

## Acknowledgments

Based on the ttrpg Monster Hearts 2 by Avery Alder
* [Monster Hearts 2](https://buriedwithoutceremony.com/monsterhearts)
