import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Bar as ProgressBar } from 'react-native-progress'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Colors, Incubator, Modal, Text, Typography, View } from 'react-native-ui-lib'
import { ThemeColors } from '../constants/Theme'
import Contract from '../services/database/entities/contract'
import Meter from '../services/database/entities/meter'
import GenericRepository from '../services/database/GenericRepository'
import { t } from '../services/i18n'
import { RootStackScreenProps } from '../types'

const { TextField } = Incubator

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

const MeterRepository = new GenericRepository(Meter as any)
const ContractRepository = new GenericRepository(Contract as any)

export default function HomeScreen({ navigation }: RootStackScreenProps<'Root'>) {
  const [visible, setVisible] = useState(false)

  // Set visible after 2 seconds using the useEffect hook
  useEffect(() => {
    setTimeout(async () => {
      setVisible(true)
      const contract = new Contract("CONTRACT", 5)
      const insertedContract = await ContractRepository.insertData(contract)
      await MeterRepository.insertData(new Meter("Test", 2, "kWh", insertedContract.id!))
      await MeterRepository.getAllData().then(ms => ms.forEach(m => console.log(m)))

      navigation.navigate("AddMeterModal")
    }, 2000)
  }, [navigation])

  return (
    <SafeAreaView
      style={ styles.container }
      bg-backgroundColor
    >
      <Modal visible={false} overlayBackgroundColor={Colors.background}>
      <Modal.TopBar title={"Add Measurement"} titleStyle={{color: Colors.onBackground, marginRight: "auto", marginLeft: -16}} doneButtonProps={{color: Colors.primary, disabled: false}} onDone={() => console.log("Save")} onCancel={() => console.log("CanceL")}/>
      </Modal>
      <View style={{width: "100%"}}>
      <ProgressBar borderRadius={0} progress={0.3} width={null} indeterminate borderWidth={0} unfilledColor={(Colors as ThemeColors).primaryContainer} color={Colors.onPrimaryContainer} />
      </View>
      <Text>{ t('common:app_name') }</Text>
      <Text style={ styles.title }>Tab One</Text>
      <View style={ styles.separator } />
      <View>
        <Text>Home Screen</Text>
        <Ripple rippleColor={(Colors as ThemeColors).onPrimary}>
          <Button
            label='Next'
            onPress={ () => console.log('clicked') }
          />
        </Ripple>
        <Ripple rippleColor={(Colors as ThemeColors).primary} rippleDuration={500} rippleContainerBorderRadius={1000}>
          <Button
            outline
            label='Next'
            onPress={ () => console.log('clicked') }
          />
        </Ripple>
        <Button
          outline
          outlineWidth={ -1 }
          label='Next'
          onPress={ () => console.log('clicked') }
        />
        <TextField
          placeholder='Floating placeholder'
          floatingPlaceholder
          floatingPlaceholderStyle={ Typography.text90B }
          style={ Typography.text60 }
          enableErrors
          validate={ ['required', 'email'] }
          validateionMessage='This field is required'
          validateOnBlur
          showCharCounter
        />
      </View>
      <Incubator.Toast
        visible={ visible }
        backgroundColor={ Colors.surface }
        iconColor={ Colors.error }
        position='bottom'
        action={ { label: 'Dismiss' } }
        enableHapticFeedback
        message='This is a toast message'
        preset='failure'
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
