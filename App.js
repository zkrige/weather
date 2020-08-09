import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, PermissionsAndroid, Platform, LayoutAnimation, UIManager, ActivityIndicator, FlatList, AppRegistry } from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation'
import moment from 'moment';
import appConfig from './src/helper/appConfig'; //Used for baseUrl
import Constant from './src/helper/themeHelper' //Used fo theme color
import { wp, hp } from './src/helper/responsiveScreen'; // Used for responsive UI
import { makeRequest } from './src/helper/apiCall'; //Used for import commom API call

const downIcon = require('./src/img/down-arrow.png');
const upIcon = require('./src/img/up-arrow.png');
const navigation = require('./src/img/navigation.png');
const cloud = require('./src/img/cloud.png');
const pressure = require('./src/img/pressure.png');

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: '',
      longitude: '',
      expandeIndex: -1,
      data: [],
      loading: false,
    }
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true); // USed for collaps animation
    }
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      this.requestLocationPermission()
    } else {
      if (this.state.latitude === '') {
        this.callLocation(this)
      } else {
      }
    }
  }

  //Check for location permission
  async requestLocationPermission() {
    const that = this;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message: 'This App needs to Access your location',
        },
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //check for GPS permission
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
          .then(data => {
            if (that.state.latitude === '') {
              that.setState({ loading: true, });
              that.callLocation(that)
            } else {
              that.setState({ loading: true, });
              that.getWeatherData()
            }
          }).catch(err => {
            that.gpsDialog()
          });
      } else {
        alert('Permission Denied')
      }
    } catch (err) {
      console.log(err)
    }
  }

  //Weather API call
  getWeatherData = () => {
    makeRequest(`${appConfig.BASE_URL}?lat=${this.state.latitude}&lon=${this.state.longitude}&exclude=hourly,minutely&appid=${appConfig.appId}&units=metric`, 'get', {}, {})
      .then((response) => {
        this.setState({
          loading: false,
          data: response.daily,
        });
      })
      .catch((error) => {
        console.log('error...', error)
        this.setState({ loading: false });
      })
  }

  //For get letitude and longitude of current location
  callLocation(that) {
    this.setState({ isGettingLocation: true, isModalVisible: false }, () => {
      Geolocation.getCurrentPosition(
        position => {
          const region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }
          this.setState({
            latitude: region.latitude,
            longitude: region.longitude,
            loading: true,
            data: [],
          }, () => {
            that.getWeatherData()
          })
        },
        error => {
          this.setState({ isGettingLocation: false })
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 2000 },
      )
    })
  }

  //check for GPS permission if denied
  gpsDialog = () => {
    const that = this;
    if (Platform.OS === 'android') {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
        .then(data => {
          if (that.state.latitude === '') {
            that.setState({ loading: true, });
            that.callLocation(that)
          } else {
            that.setState({ loading: true, });
            that.getWeatherData()
          }
        }).catch(err => {
          this.gpsDialog()
        });
    }
  }

  //For handle expand
  toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (this.state.expandeIndex == index) {
      this.setState({ expandeIndex: -1 })
    } else {
      this.setState({ expandeIndex: index })
    }
  }

  //List item rowUI
  renderRow = ({ index, item }) => {
    const { row, weatherImageView, dropDownImage, topWeatherIcon, detailWeatherIcon, icon, text, rowCenter, center, rowLight } = styles;
   
    return (
      <View style={styles.backgroundview}>
        <TouchableOpacity style={row} onPress={() => this.toggleExpand(index)}>
          <View>
            <Text>{moment(new Date(item.dt * 1000).toGMTString()).format('ddd, MMM DD')}</Text>
          </View>
          <View style={row}>
            <Image source={{ uri: `${appConfig.iconUrl}${item.weather[0].icon}.png` }}
              style={topWeatherIcon} resizeMode={"contain"} />
            <Text>{`${item.temp.max}/${item.temp.min}°C`}</Text>
            <Image source={this.state.expandeIndex == index ? upIcon : downIcon} style={dropDownImage} resizeMode={"contain"} />
          </View>
        </TouchableOpacity>

        {this.state.expandeIndex == index &&
          <View style={{ marginTop: hp(1) }}>

            <View style={row}>
              <View style={weatherImageView}>
                <Image source={{ uri: `${appConfig.iconUrl}${item.weather[0].icon}.png` }} style={detailWeatherIcon} resizeMode={"contain"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text>{item.weather[0].description}</Text>
                <Text style={{ ...text, marginTop: hp(0.5) }}>{`The high will be ${item.temp.max}°C, The low will be ${item.temp.min}°C`}</Text>
              </View>
            </View>

            <View style={{ ...row, marginTop: hp(3) }} >
              <View style={{ flex: 0.3 }} >
                <Text></Text>
              </View>
              <View style={{ flex: 0.23 }}>
                <Text style={text}>Morning</Text>
              </View>

              <View style={{ flex: 0.23 }}>
                <Text style={text}>Evening</Text>
              </View>
              <View style={{ flex: 0.23 }}>
                <Text style={text}>Night</Text>
              </View>
            </View>

            <View style={row} >
              <View style={{ flex: 0.3 }}>
                <Text style={text}>TEMPERATURE</Text>
              </View>
              <View style={{ flex: 0.23 }}>
                <Text>{`${item.temp.morn}°C`}</Text>
              </View>

              <View style={{ flex: 0.23 }}>
                <Text>{`${item.temp.eve}°C`}</Text>
              </View>
              <View style={{ flex: 0.23 }}>
                <Text >{`${item.temp.night}°C`}</Text>
              </View>
            </View>

            <View style={{ ...row, marginTop: hp(1) }} >
              <View style={{ flex: 0.3 }}>
                <Text style={text}>FEELS LIKE</Text>
              </View>
              <View style={{ flex: 0.23 }}>
                <Text >{`${item.feels_like.morn}°C`}</Text>
              </View>

              <View style={{ flex: 0.23 }}>
                <Text >{`${item.feels_like.eve}°C`}</Text>
              </View>
              <View style={{ flex: 0.23 }}>
                <Text >{`${item.feels_like.night}°C`}</Text>
              </View>
            </View>


            <View style={{ ...row, marginTop: hp(4) }} >
              <View style={center}>
                <View style={rowCenter}>
                  <Image source={cloud} style={icon} resizeMode={"contain"} />
                  <Text>{`${item.clouds}%`}</Text>
                </View>
                <View style = {rowLight}>
                <Text style={text}>Humidity: </Text><Text>{`${item.humidity}%`}</Text>
                </View>
              </View>
              <View style={center}>
                <View style={rowCenter}>
                  <Image source={navigation} style={icon} resizeMode={"contain"} />
                  <Text>{`${item.wind_speed}m/s`}</Text>
                </View>
                <View style = {rowLight}>
                <Text style={text}>UV: </Text><Text >{item.uvi}</Text>
                </View>
              </View>
              <View style={center}>
                <View style={rowCenter}>
                  <Image source={pressure} style={icon} resizeMode={"contain"} />
                  <Text>{`${item.pressure}hPa`}</Text>
                </View>
                <View style = {rowLight}>
                <Text style={text}>Dew point: </Text><Text>{`${item.dew_point}°C`}</Text>	
                </View>
              </View>
            </View>

            <View style={{ ...row, marginTop: hp(3) }} >
              <View style={{ flex: 0.25 }} >
                <Text style={text}>SUNRISE</Text>
              </View>
              <View style={{ flex: 0.75 }} >
                <Text style={text}>SUNSET</Text>
              </View>

            </View>

            <View style={row} >
              <View style={{ flex: 0.25 }}>
                <Text>{moment(new Date(item.sunrise * 1000).toGMTString()).format('h:mm a')}</Text>
              </View>
              <View style={{ flex: 0.75 }} >
                <Text>{moment(new Date(item.sunset * 1000).toGMTString()).format('h:mm a')}</Text>
              </View>

            </View>
          </View>
        }
      </View>
    )
  }

  render() {
    const { data, loading } = this.state;
    return (
      <View style={{ flex: 1, }}>
        <View style={{ paddingTop: wp(5) }}>
          <FlatList
            data={data}
            ListHeaderComponent={
              (loading) ?
                <View >
                  <ActivityIndicator
                    animating={loading} size="large" color='#000000' />
                </View>
                :
                null
            }
            renderItem={this.renderRow}
            keyExtractor={(item, index) => {
              return index + "";
            }}
          />
        </View>
      </View>
    )
  }

}

//css for page
const styles = StyleSheet.create({
  backgroundview: {
    marginBottom: wp(5),
    marginLeft: wp(3),
    marginRight: wp(3),
    marginTop: wp(1),
    backgroundColor: Constant.color.white,
    borderColor: Constant.color.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    padding: wp(3),
    elevation: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  weatherImageView: {
    marginRight: wp(3),
    justifyContent: 'center'
  },
  dropDownImage: {
    width: wp(3),
    height: hp(3),
    marginLeft: wp(2)
  },
  topWeatherIcon: {
    width: wp(8),
    height: hp(3),
    marginLeft: wp(2)
  },
  detailWeatherIcon: {
    width: wp(10),
    height: hp(6)
  },
  icon: {
    width: wp(4),
    height: hp(3),
    marginRight: wp(2)
  },
  text: {
    color: Constant.color.darkGray
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowLight:{
    flexDirection:'row'
  }
});

export default App