import { db } from '@/database/db'
import {
  building,
  contract,
  contractRevision,
  meter,
  reading,
} from '@/database/schema'
import { useEffect } from 'react'

export async function seed() {
  await db.delete(contract).execute()
  await db
    .insert(contract)
    .values([
      {
        id: 1,
        name: 'meinSWK DIREKT Gas',
        identifier: 'contract1',
        buildingId: 1,
        unitId: 1,
      },
      {
        id: 2,
        name: 'meinSWK DIREKT Strom',
        identifier: 'contract2',
        buildingId: 1,
        unitId: 1,
      },
    ])
    .then(() => console.log('Contracts seeded'))
    .catch((err) => console.error('Error seeding contracts', err))
  await db.delete(contractRevision).execute()
  await db
    .insert(contractRevision)
    .values([
      {
        id: 1,
        pricePerUnit: 0.1546,
        basePayment: 184.69,
        monthlyPayment: 55,
        startDate: new Date(1729008406000),
        endDate: null,
        contractId: 1,
      },
      {
        id: 2,
        pricePerUnit: 0.3488,
        basePayment: 211.11,
        monthlyPayment: 89,
        startDate: new Date(1728908906000),
        endDate: null,
        contractId: 2,
      },
    ])
    .then(() => console.log('Contract revisions seeded'))
    .catch((err) => console.error('Error seeding contract revisions', err))
  await db.delete(meter).execute()
  await db
    .insert(meter)
    .values([
      {
        id: 1,
        name: 'Strom',
        identifier: 'meter1',
        precision: 2,
        isActive: true,
        sortOrder: 3,
        buildingId: 1,
        typeId: 1,
        unitId: 1,
        contractId: 2,
      },
      {
        id: 2,
        name: 'Gas',
        identifier: 'meter2',
        precision: 2,
        isActive: true,
        sortOrder: 2,
        buildingId: 1,
        typeId: 3,
        unitId: 7,
        contractId: 1,
      },
      {
        id: 3,
        name: 'Gas old',
        identifier: 'meter3',
        precision: 2,
        isActive: true,
        sortOrder: 2,
        buildingId: 1,
        typeId: 3,
        unitId: 7,
        contractId: 1,
      },
      {
        id: 4,
        name: 'Gas older',
        identifier: 'meter4',
        precision: 2,
        isActive: true,
        sortOrder: 2,
        buildingId: 1,
        typeId: 3,
        unitId: 7,
        contractId: 1,
      },
      {
        id: 5,
        name: 'Gas oldest',
        identifier: 'meter5',
        precision: 2,
        isActive: true,
        sortOrder: 2,
        buildingId: 1,
        typeId: 3,
        unitId: 7,
        contractId: 1,
      },
    ])
    .then(() => console.log('Meters seeded'))
    .catch((err) => console.error('Error seeding meters', err))
  await db.delete(reading).execute()
  await db
    .insert(reading)
    .values([
      { value: 0, meterId: 2, timestamp: new Date(1680197133000) },
      { value: 34.684, meterId: 2, timestamp: new Date(1681752351000) },
      { value: 69.119, meterId: 2, timestamp: new Date(1692121702000) },
      { value: 70.643, meterId: 2, timestamp: new Date(1692524835000) },
      { value: 70.85, meterId: 2, timestamp: new Date(1693047492000) },
      { value: 70.85, meterId: 2, timestamp: new Date(1693850872000) },
      { value: 73.092, meterId: 2, timestamp: new Date(1694373327000) },
      { value: 73.148, meterId: 2, timestamp: new Date(1695665378000) },
      { value: 74.793, meterId: 2, timestamp: new Date(1696264334000) },
      { value: 76.907, meterId: 2, timestamp: new Date(1696753583000) },
      { value: 78.562, meterId: 2, timestamp: new Date(1697364881000) },
      { value: 92.978, meterId: 2, timestamp: new Date(1697976634000) },
      { value: 108.8845, meterId: 2, timestamp: new Date(1698688858000) },
      { value: 124.528, meterId: 2, timestamp: new Date(1699202187000) },
      { value: 145.953, meterId: 2, timestamp: new Date(1699787478000) },
      { value: 171.232, meterId: 2, timestamp: new Date(1700399576000) },
      { value: 195.998, meterId: 2, timestamp: new Date(1700999847000) },
      { value: 236.041, meterId: 2, timestamp: new Date(1701795973000) },
      { value: 269.701, meterId: 2, timestamp: new Date(1702576237000) },
      { value: 301.836, meterId: 2, timestamp: new Date(1703429132000) },
      { value: 319.345, meterId: 2, timestamp: new Date(1704024410000) },
      { value: 344.587, meterId: 2, timestamp: new Date(1704661535000) },
      { value: 374.3415, meterId: 2, timestamp: new Date(1705229994000) },
      { value: 416.796, meterId: 2, timestamp: new Date(1706110377000) },
      { value: 436.355, meterId: 2, timestamp: new Date(1706730592000) },
      { value: 456.86, meterId: 2, timestamp: new Date(1707411018000) },
      { value: 463.7255, meterId: 2, timestamp: new Date(1707648549000) },
      { value: 469.11, meterId: 2, timestamp: new Date(1707854927000) },
      { value: 477.8885, meterId: 2, timestamp: new Date(1708248494000) },
      { value: 497.639, meterId: 2, timestamp: new Date(1708864975000) },
      { value: 523.1245, meterId: 2, timestamp: new Date(1709656619000) },
      { value: 531.464, meterId: 2, timestamp: new Date(1710715002000) },
      { value: 545.072, meterId: 2, timestamp: new Date(1711276025000) },
      { value: 564.252, meterId: 2, timestamp: new Date(1711997948000) },
      { value: 574.132, meterId: 2, timestamp: new Date(1712485489000) },
      { value: 576.717, meterId: 2, timestamp: new Date(1713124452000) },
      { value: 597.092, meterId: 2, timestamp: new Date(1714372147000) },
      { value: 601.655, meterId: 2, timestamp: new Date(1715416719000) },
      { value: 603.929, meterId: 2, timestamp: new Date(1716113876000) },
      { value: 610.583, meterId: 2, timestamp: new Date(1717923274000) },
      { value: 612.539, meterId: 2, timestamp: new Date(1718555813000) },
      { value: 615.021, meterId: 2, timestamp: new Date(1719381660000) },
      { value: 616.916, meterId: 2, timestamp: new Date(1720274489000) },
      { value: 618.409, meterId: 2, timestamp: new Date(1720862335000) },
      { value: 623.755, meterId: 2, timestamp: new Date(1722778438000) },
      { value: 626.555, meterId: 2, timestamp: new Date(1723443032000) },
      { value: 629.102, meterId: 2, timestamp: new Date(1724047413000) },
      { value: 631.403, meterId: 2, timestamp: new Date(1724598123000) },
      { value: 634.115, meterId: 2, timestamp: new Date(1725179539000) },
      { value: 636.365, meterId: 2, timestamp: new Date(1725783323000) },
      { value: 639.054, meterId: 2, timestamp: new Date(1727000691000) },
      { value: 646.32, meterId: 2, timestamp: new Date(1728201093000) },
      { value: 658.336, meterId: 2, timestamp: new Date(1729059087000) },
      { value: 49177, meterId: 1, timestamp: new Date(1677781069000) },
      { value: 49370.9, meterId: 1, timestamp: new Date(1681752423000) },
      { value: 49753.4, meterId: 1, timestamp: new Date(1692121732000) },
      { value: 49769.45, meterId: 1, timestamp: new Date(1692524464000) },
      { value: 49775.45, meterId: 1, timestamp: new Date(1693047515000) },
      { value: 49780.8, meterId: 1, timestamp: new Date(1693850892000) },
      { value: 49806.1, meterId: 1, timestamp: new Date(1694373309000) },
      { value: 49815.75, meterId: 1, timestamp: new Date(1695665404000) },
      { value: 49851.9, meterId: 1, timestamp: new Date(1696264348000) },
      { value: 49886.55, meterId: 1, timestamp: new Date(1696753561000) },
      { value: 49921.45, meterId: 1, timestamp: new Date(1697364864000) },
      { value: 49957.25, meterId: 1, timestamp: new Date(1697976607000) },
      { value: 49992.28, meterId: 1, timestamp: new Date(1698688843000) },
      { value: 50020.76, meterId: 1, timestamp: new Date(1699202163000) },
      { value: 50048.48, meterId: 1, timestamp: new Date(1699787461000) },
      { value: 50084, meterId: 1, timestamp: new Date(1700399546000) },
      { value: 50122, meterId: 1, timestamp: new Date(1700999822000) },
      { value: 50169.15, meterId: 1, timestamp: new Date(1701795954000) },
      { value: 50214.6, meterId: 1, timestamp: new Date(1702576219000) },
      { value: 50262.7, meterId: 1, timestamp: new Date(1703429118000) },
      { value: 50290.55, meterId: 1, timestamp: new Date(1704024395000) },
      { value: 50331.6, meterId: 1, timestamp: new Date(1704661567000) },
      { value: 50361.68, meterId: 1, timestamp: new Date(1705229973000) },
      { value: 50413.3, meterId: 1, timestamp: new Date(1706110366000) },
      { value: 50448.95, meterId: 1, timestamp: new Date(1706730573000) },
      { value: 50492.65, meterId: 1, timestamp: new Date(1707411001000) },
      { value: 50503.7, meterId: 1, timestamp: new Date(1707648537000) },
      { value: 50521.85, meterId: 1, timestamp: new Date(1707854864000) },
      { value: 50549.55, meterId: 1, timestamp: new Date(1708248479000) },
      { value: 50589.9, meterId: 1, timestamp: new Date(1708864950000) },
      { value: 50636.3, meterId: 1, timestamp: new Date(1709656608000) },
      { value: 50654, meterId: 1, timestamp: new Date(1710714975000) },
      { value: 50683.75, meterId: 1, timestamp: new Date(1711276005000) },
      { value: 50730.45, meterId: 1, timestamp: new Date(1711997925000) },
      { value: 50759.55, meterId: 1, timestamp: new Date(1712485475000) },
      { value: 50776.9, meterId: 1, timestamp: new Date(1713124423000) },
      { value: 50831.9, meterId: 1, timestamp: new Date(1714372131000) },
      { value: 50876, meterId: 1, timestamp: new Date(1715416701000) },
      { value: 50905.1, meterId: 1, timestamp: new Date(1716113860000) },
      { value: 50974, meterId: 1, timestamp: new Date(1717923265000) },
      { value: 50999.9, meterId: 1, timestamp: new Date(1718555800000) },
      { value: 51033.4, meterId: 1, timestamp: new Date(1719381648000) },
      { value: 51065.55, meterId: 1, timestamp: new Date(1720274472000) },
      { value: 51090.7, meterId: 1, timestamp: new Date(1720862318000) },
      { value: 51156.8, meterId: 1, timestamp: new Date(1722778426000) },
      { value: 51182.8, meterId: 1, timestamp: new Date(1723443021000) },
      { value: 51207.2, meterId: 1, timestamp: new Date(1724047384000) },
      { value: 51229.2, meterId: 1, timestamp: new Date(1724598112000) },
      { value: 51255.8, meterId: 1, timestamp: new Date(1725179525000) },
      { value: 51276.3, meterId: 1, timestamp: new Date(1725783312000) },
      { value: 51303.8, meterId: 1, timestamp: new Date(1727000681000) },
      { value: 51347, meterId: 1, timestamp: new Date(1728201082000) },
      { value: 51389.9, meterId: 1, timestamp: new Date(1729059072000) },
    ])
    .then(() => console.log('Readings seeded'))
    .catch((err) => console.error('Error seeding readings', err))

  await db.delete(building).execute()
  await db
    .insert(building)
    .values([
      {
        id: 1,
        name: 'default',
        isDefault: true,
      },
      {
        id: 2,
        name: 'Building 1',
        address: '123 Main St',
        notes: 'This is a test building',
      },
    ])
    .then(() => console.log('Building seeded'))
    .catch((err) => console.error('Error seeding building', err))
}

export function useSeed() {
  return useEffect(() => {
    seed()
  }, [])
}
