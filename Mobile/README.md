# Using Melon Protocol in Mobile App  

This project uses [React Native](https://facebook.github.io/react-native/docs/getting-started.html) to implement [melon.js protocol](https://github.com/melonproject/protocol).

## [JUGAAD](https://en.wikipedia.org/wiki/Jugaad)

react-native link react-native-fs   

react-native link react-native-tls   

react-native link react-native-randombytes   

react-native link react-native-gesture-handler

sed -i.bk 's/${Contracts.//' node_modules/@melonproject/protocol/lib/Contracts.js  

sed -i.bk 's/}.abi.json/.abi.json/' node_modules/@melonproject/protocol/lib/Contracts.js    

sed -i.bk 's/${deploymentId}.json/kovan-kyberPrice.json/' node_modules/@melonproject/protocol/lib/utils/environment/withDeployment.js