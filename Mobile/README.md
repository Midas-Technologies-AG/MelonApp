# Mobile Interface
This is React Native based implementation of a mobile interface for Melon Projects's JavaScript Library.

![Screenshot](https://github.com/Midas-Technologies-AG/MelonApp/raw/master/Mobile/docs/main.png =320x)

## Installation
 `npm install`
  `npm run patch`*
   `react-native start`
  \
  \
  The next steps are platform specific:
__Android__:  `react-native run-android`
__iOS__: `react-native run-ios`


## How to Contribute

In order to add a new module, follow these steps:
1. Write the functionality, as per need, in the wrapper and export it for usage in component
2. Add a new view for the module. Use JSX to write the component and manage its state. Call the function from the wrapper here.
3. Make use of/add new components that are reusable.
4. (Optional) You may make use of existing `helper` functions or add your own.  

You may then continue by __requesting a pull__ on this repo or use a __fork__ of this.  

If you find something incompatible or something isn't working as it should be, __please open an issue__ with detailed explaination, build log and maybe a screenshot.


## Future development

 - [ ] Separate out the functionalities from melon wrapper to independent files
 - [ ] Refresh balance upon making/taking/cancelling order
 - [ ] Refresh AUM upon making/taking/cancelling order
 - [ ] Implement `returnAssetToVault` to return assets from trading contract to vault contract
 - [ ] Implement comparative orderbook graph ranging from lowest volume offer to highest volume offer.