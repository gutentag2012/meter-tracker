import { StatusBar } from 'expo-status-bar'
import { Platform, StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'

import { Colors, Modal, Text, View } from 'react-native-ui-lib'
import { CloseIcon } from '../../components/icons/CloseIcon'
import { ThemeColors } from '../../constants/Theme'
import { t } from '../../services/i18n'

export default function AddMeterModal() {
  return (
    <Modal
      visible
      overlayBackgroundColor={ Colors.background }
    >
      <View
        style={ {
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        } }
      >
        <Ripple rippleColor={ (Colors as ThemeColors).onBackground } rippleContainerBorderRadius={100} style={{padding: 4}}>
          <CloseIcon size={ 24 } />
        </Ripple>
        <Text style={{fontSize: 20, marginLeft: 16}}>{ t('add_meter_modal:title') }</Text>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */ }
      <StatusBar style={ Platform.OS === 'ios' ? 'light' : 'auto' } />
    </Modal>
  )
}

const styles = StyleSheet.create({})
