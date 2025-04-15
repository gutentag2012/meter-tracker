import { type Language } from './en'

export const de: Language = {
  pages: {
    home: 'Meter Tracker',
    settings: 'Einstellungen',
  },
  general: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    close: 'Schließen',
    delete: 'Löschen',
    select: 'Auswählen',
    apply: 'Anwenden',
    edit: "Bearbeiten",
    ok: "Ok",
    clear: 'Leeren',
    reset: 'Zurücksetzen',
    day: 'Tag',
    activate: 'Aktivieren',
    typeHere: 'Hier eingeben...',
    perDay: '/Tag',
  },
  buildings: {
    toast: {
      creating: 'Gebäude wird erstellt...',
      updating: 'Gebäude wird aktualisiert...',
      deleting: 'Gebäude wird gelöscht...',
      didCreate: 'Gebäude erfolgreich erstellt',
      didUpdate: 'Gebäude erfolgreich aktualisiert',
      didDelete: 'Gebäude erfolgreich gelöscht',
    },

    createSectionActions: 'Aktionen',
    createModalTitle: 'Gebäude erstellen',
    updateModalTitle: 'Gebäude bearbeiten',
    createLabelName: 'Name *',
    createLabelAddress: 'Adresse',
    createLabelNotes: 'Notizen',

    actionDelete: 'Gebäude löschen',
    actionDeleteDescription:
      'Alle Daten werden gelöscht, diese Aktion kann nicht rückgängig gemacht werden',
    alertDeleteTitle: 'Sind Sie sicher?',
    alertDeleteDescription:
      'Alle Gebäudedaten werden dauerhaft gelöscht und diese Aktion kann nicht rückgängig gemacht werden.',
    lastBuildingWarning: 'Sie können das letzte Gebäude nicht löschen',

    defaultName: 'Zuhause',
    modalTitle: 'Gebäude auswählen',
    createButton: 'Gebäude erstellen',
    defaultMarked: 'Standard',
    markAsDefault: 'Als Standard markieren',
  },
  readings: {
    toast: {
      creating: 'Messung wird erstellt...',
      updating: 'Messung wird aktualisiert...',
      deleting: 'Messung wird gelöscht...',
      didCreate: 'Messung erfolgreich erstellt',
      didUpdate: 'Messung erfolgreich aktualisiert',
      didDelete: 'Messung erfolgreich gelöscht',
    },

    createModalTitle: 'Messung erstellen',
    updateModalTitle: 'Messung bearbeiten',
    createLabelValue: 'Zählerstand *',
    createLabelTimestamp: 'Zeitstempel *',
    createLabelMeter: 'Messgerät *',
    lastReadingHint: 'Der letzte Zählerstand war %{value} am %{timestamp}',
    noLastReadingHint: 'Kein letzter Zählerstand verfügbar',
    createSectionActions: 'Aktionen',
    actionDelete: 'Messung löschen',
    actionDeleteDescription:
      'Alle Daten werden gelöscht, diese Aktion kann nicht rückgängig gemacht werden',
    alertDeleteTitle: 'Sind Sie sicher?',
    alertDeleteDescription:
      'Dieser Eintrag wird dauerhaft gelöscht und diese Aktion kann nicht rückgängig gemacht werden.',
  },
  meters: {
    toast: {
      creating: 'Messgerät wird erstellt...',
      updating: 'Messgerät wird aktualisiert...',
      deleting: 'Messgerät wird gelöscht...',
      resetting: 'Messgerät wird zurückgesetzt...',
      removingReset: 'Zurücksetzung wird entfernt...',
      didCreate: 'Messgerät erfolgreich erstellt',
      didUpdate: 'Messgerät erfolgreich aktualisiert',
      didDelete: 'Messgerät erfolgreich gelöscht',
      didReset: 'Zurücksetzung erfolgreich erstellt',
      didRemoveReset: 'Zurücksetzung erfolgreich entfernt',
    },

    selectTitle: 'Messgerät auswählen',
    createModalTitle: 'Messgerät erstellen',
    updateModalTitle: 'Messgerät bearbeiten',
    createLabelName: 'Name *',
    createLabelIdentifier: 'Kennung',
    createLabelPrecision: 'Genauigkeit *',
    createLabelPrecisionHint: 'Anzahl der Dezimalstellen',
    createLabelUnit: 'Messeinheit *',
    createLabelMeterType: 'Messart *',
    createLabelMeterTypeHint:
      'Bestimmt, wie Verbräuche interpretiert und angezeigt werden',
    createLabelContract: 'Vertrag',
    createLabelCustomUnitConversion: 'Benutzerdefinierte Einheitenumrechnung',
    createLabelCustomUnitConversionHint:
      'Wenn leer, wird die Standard-Einheitenumrechnung verwendet',
    createSectionActions: 'Aktionen',
    createSectionConversion: 'Umrechnung',
    createSectionConversionHint:
      'Basierend auf der Einheit des Vertrags und der Einheit dieses Messgeräts wird der Preis berechnet',

    createSectionResets: "Zurücksetzungen",
    createSectionDescriptionResets: "Wenn Ihr Messgerät zurückgesetzt wird, können Sie es hier festhalten. Der letzte Wert wird zu allen neuen Messungen hinzugefügt.",

    createSectionContracts: 'Vertrag',
    advancedContractOptions: 'Erweiterte Vertragsoptionen',
    actionReset: 'Messgerät zurücksetzen',
    actionResetDescription:
      'Behält den letzten Wert bei und fügt ihn zu allen neuen Messungen hinzu',
    actionInactive: 'Messgerät als inaktiv markieren',
    actionInactiveDescription:
      'Das Messgerät wird nicht mehr auf dem Dashboard angezeigt',
    actionDelete: 'Messgerät löschen',
    actionDeleteDescription:
      'Alle Daten werden gelöscht, diese Aktion kann nicht rückgängig gemacht werden',
    alertDeleteTitle: 'Sind Sie sicher?',
    alertDeleteDescription:
      'Alle Daten werden dauerhaft gelöscht und diese Aktion kann nicht rückgängig gemacht werden.',
    sectionTitle: 'Messgeräte',
    createButton: 'Messgerät erstellen',
    emptyList: 'Sie haben noch keine Messgeräte.',
    graphs: {
      noData: 'Keine Daten verfügbar',
      perDayTitle: 'Verbrauch pro Tag',
      perYearTitle: 'Verbrauch pro Jahr',
      filter: 'Filtern',
      from: 'Von',
      until: 'Bis',
      yearSelectionTitle: 'Nur ausgewählte Jahre',
      yearSelectionTitleHint: 'Überschreibt die Datumsauswahl',
    },
  },
  contracts: {
    toast: {
      creating: 'Vertrag wird erstellt...',
      updating: 'Vertrag wird aktualisiert...',
      deleting: 'Vertrag wird gelöscht...',
      didCreate: 'Vertrag erfolgreich erstellt',
      didUpdate: 'Vertrag erfolgreich aktualisiert',
      didDelete: 'Vertrag erfolgreich gelöscht',
    },

    createModalTitle: 'Vertrag erstellen',
    updateModalTitle: 'Vertrag bearbeiten',
    createLabelName: 'Name *',
    createLabelIdentifier: 'Kennung',
    createLabelUnit: 'Messeinheit *',
    createLabelPricePerUnit: 'Preis pro Einheit *',
    createLabelBasePayment: 'Grundgebühr',
    createLabelBasePaymentHint:
      'Ein fester Betrag, den Sie pro Jahr zahlen müssen',
    createLabelMonthlyPayment: 'Monatliche Zahlung',
    createLabelMonthlyPaymentHint:
      'Wie viel Sie dem Anbieter jeden Monat zahlen müssen',
    createLabelStartDate: 'Startdatum *',
    createLabelEndDate: 'Enddatum',
    createSectionRevision: 'Revision',
    actionNewRevision: 'Neue Revision erstellen',
    actionNewRevisionDescription:
      'Wenn sich die Bedingungen des Vertrags geändert haben, erstellen Sie eine neue Revision',
    createSectionActions: 'Aktionen',
    actionDelete: 'Vertrag löschen',
    actionDeleteDescription:
      'Alle Daten werden gelöscht, diese Aktion kann nicht rückgängig gemacht werden',
    alertDeleteTitle: 'Sind Sie sicher?',
    alertDeleteDescription:
      'Alle Daten werden dauerhaft gelöscht und diese Aktion kann nicht rückgängig gemacht werden.',
    newRevisionHeader: 'Neu',
    selectTitle: 'Vertrag auswählen',
    selectValueEmpty: 'Kein Vertrag',
    sectionTitle: 'Verträge',
    createButton: 'Vertrag erstellen',
    emptyList: 'Sie haben noch keine Verträge.',
    startMustBeAfterPreviousRevisions:
      'Startdatum muss nach dem Enddatum vorheriger Revisionen liegen',
    warningEditingExistingRevision:
      'Achtung: Eine bestehende Revision sollte nur zur Korrektur von Fehlern bearbeitet werden. Für Aktualisierungen fügen Sie bitte eine neue Revision hinzu.',
  },
  meterTypes: {
    selectTitle: 'Messart auswählen',
    consumption: {
      name: 'Verbrauch',
      description:
        'Messgerät zur Messung des Verbrauchs einer Ressource (z. B. Strom, Wasser, Gas)',
    },
    'consumption:tank': {
      name: 'Verbrauch (Tank)',
      description:
        'Messgerät zur Messung des Verbrauchs einer Ressource, die nachgefüllt werden kann (z. B. Heizöl)',
    },
    generation: {
      name: 'Erzeugung',
      description:
        'Messgerät zur Messung der Erzeugung einer Ressource (z. B. Solaranlagen)',
    },
  },
  units: {
    selectTitle: 'Messeinheit auswählen',
    kwh: 'Kilowattstunde',
    mwh: 'Megawattstunde',
    gwh: 'Gigawattstunde',
    w: 'Watt',
    l: 'Liter',
    m3: 'Kubikmeter (Wasser)',
    'm3-gas-natural': 'Kubikmeter (Erdgas)',
    percent: 'Prozent',
  },
  errors: {
    endAfterStart: 'Enddatum muss nach dem Startdatum liegen',
    required: 'Dieses Feld ist erforderlich',
    min1: 'Mindestlänge beträgt 1 Zeichen',
    number: 'Muss eine Zahl sein',
    integer: 'Muss eine ganze Zahl sein',
    positive: 'Muss eine positive Zahl sein',
    date: 'Muss ein gültiges Datum sein',
    lessThan31: 'Muss kleiner gleich 31 sein',
    timeHour: 'Muss zwischen 0 und 23 liegen',
    timeMinute: 'Muss zwischen 0 und 59 liegen',
  },
  settings: {
    headerGeneral: 'Allgemein',
    currencyOptionTitle: 'Währung',
    currencyOptionDescription: `Ausgewählt: {{currency}}`,
    currencySelectTitle: 'Währung auswählen',
    currencySelectValues: {
      undefined: 'Systemstandard',
      defaultDescription: 'Währung, die durch die Systemsprache definiert ist',
      EUR: 'Euro',
      USD: 'US-Dollar',
      GBP: 'Britisches Pfund',
    },
    languageOptionTitle: 'Sprache',
    languageOptionDescription: 'Ausgewählte Sprache: {{language}}',
    languageSelectTitle: 'Sprache auswählen',
    languageSelectValues: {
      undefined: 'Systemstandard',
      defaultDescription: 'Sprache, die durch das System definiert ist',
      en: 'Englisch',
      de: 'Deutsch',
    },
    languageChangeWarning: 'Das Ändern der Sprache wird die App neu laden',
    languageChangeReloadReason: 'Sprache geändert',
    themeOptionTitle: 'Darstellung',
    themeOptionDescription: 'Ausgewählte Darstellung: {{theme}}',
    themeSelectTitle: 'Darstellung auswählen',
    themeSelectValues: {
      undefined: 'Systemstandard',
      defaultDescription: 'Darstellung, die im System eingestellt ist',
      light: 'Hell',
      dark: 'Dunkel',
    },
    headerData: 'Daten',
    exportOptionTitle: 'Daten exportieren',
    exportOptionDescription: 'Exportieren Sie alle Daten als Datei',
    importOptionTitle: 'Daten importieren',
    importOptionDescription:
      'Importieren Sie Daten aus einer ausgewählten CSV-Datei',
    headerReminder: 'Erinnerung ', // The sapce needs to be there, because for some reason otherwise there is a new line after
    reminderStatusOptionTitle: 'Status',
    reminderStatusOptionDescriptionGranted:
      'Keine Probleme, alle Berechtigungen sind erteilt',
    reminderStatusOptionDescriptionDenied:
      'Berechtigung abgelehnt | Um Erinnerungen zu aktivieren, erteilen Sie die Berechtigung in den Einstellungen',
    reminderStatusOptionDescriptionUndetermined:
      'Berechtigung nicht festgelegt | Aktiviere Erinnerungen und erteile die Berechtigung',
    enableReminderTitle: 'Erinnerung aktivieren',
    enableReminderDescription:
      'Eine regelmäßige Erinnerung, neue Zählerstände einzutragen',
    reminderIntervalTitle: 'Erinnerungsintervall',
    reminderIntervalDialogSectionInterval: 'Intervall',
    reminderIntervalDialogSectionWeekday: 'Wochentag',
    reminderIntervalDialogSectionHour: 'Stunde',
    reminderIntervalDialogSectionMinute: 'Minute',
    reminderIntervalDialogSectionDayOfMonth: 'Tag des Monats',
    reminderIntervalDialogSectionDayOfMonthHint: 'Muss zwischen 1 und 31 liegen',
    reminderIntervalDialogSectionMonth: 'Monat',
    headerDangerZone: 'Gefahrenzone',
    activateDangerZoneTitle: 'Gefahrenzone aktivieren',
    activateDangerZoneTitleDisable: 'Gefahrenzone deaktivieren',
    activateDangerZoneDescription:
      'Nur aktivieren, wenn Sie wissen, was Sie tun',
    dangerZoneAlertTitle: 'Gefahrenzone aktivieren',
    dangerZoneAlertDescription: 'Nur aktivieren, wenn Sie wissen, was Sie tun',
    resetOptionTitle: 'Alle Daten zurücksetzen',
    resetOptionDescription:
      'Dies löscht alle Daten dauerhaft und kann nicht rückgängig gemacht werden',
    permissionDialogTitle: 'Benachrichtigungsberechtigungen',
    permissionDialogDescription:
      'Um Erinnerungen zu aktivieren, brauchen wir Ihre Erlaubnis. Sie können dies in den Einstellungen tun.',
    goToSettings: 'Zu den Einstellungen',

    export: {
      pageTitle: "Exportieren",
      startButton: "Export starten",
      headerBuildings: "Gebäude",
      buildings: {
        id: 'ID',
        name: 'Name',
        address: 'Adresse',
        notes: 'Notizen',
        isDefault: 'Ist Standard',
      },
      headerContracts: "Verträge",
      contracts: {
        id: 'ID',
        name: 'Name',
        identifier: 'Kennung',
        unit: 'Messeinheit',
        buildingId: 'Gebäude ID',
      },
      headerContractRevision: "Vertrags-Revisionen",
      contractRevision: {
        pricePerUnit: 'Preis pro Einheit',
        basePayment: 'Grundgebühr',
        monthlyPayment: 'Monatliche Zahlung',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        contractId: 'Vertrag ID',
      },
      headerMeters: "Messgeräte",
      meters: {
        id: 'ID',
        name: 'Name',
        identifier: 'Kennung',
        precision: 'Genauigkeit',
        sortOrder: 'Sortierung',
        customUnitConversion: 'Benutzerdefinierte Einheitenumrechnung',
        type: 'Messart',
        unit: 'Messeinheit',
        buildingId: 'Gebäude ID',
        contractId: 'Vertrag ID',
      },
      headerMeterReadings: "Messungen",
      meterReadings: {
        id: 'ID',
        value: 'Zählerstand',
        timestamp: 'Zeitstempel',
        valueBeforeReset: 'Wert vor Zurücksetzung',
        meterId: 'Messgerät ID',
      },
    }
  },
  intervals: {
    daily: 'Täglich',
    monthly: 'Monatlich',
    weekly: 'Wöchentlich',
    yearly: 'Jährlich',
  },
  reminder: {
    channel: 'Erinnerung',
    title: 'Zählerstand-Erinnerung',
    body: 'Es ist Zeit, Ihre Zählerstände einzugeben',
  },
}
