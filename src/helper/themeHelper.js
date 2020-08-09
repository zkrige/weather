import {Platform, Dimensions} from 'react-native'

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')

const isIOS = Platform.OS === 'ios'
const d = Dimensions.get('window')

module.exports = {
  //API Constant
  color: {
    darkGray: '#B3B3B3',
    white: '#ffffff'
  },
  isIOS: isIOS,
  isANDROID: Platform.OS === 'android',
  isiPAD: SCREEN_HEIGHT / SCREEN_WIDTH < 1.6,
  isX:
    Platform.OS === 'ios' && (d.height > 800 || d.width > 800) ? true : false,

}
