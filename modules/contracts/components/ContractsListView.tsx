import { ContractListEntry } from '@/contracts/components/ContractListEntry'
import { type DetailedContract } from '@/contracts/contracts.selector'
import { contractsForBuilding } from '@/contracts/contracts.signals'
import React, { type FC } from 'react'

type Props = {
  onPress: (contract: DetailedContract) => void
}

export const ContractListView: FC<Props> = ({ onPress }) => {
  return (
    <>
      {contractsForBuilding.value.map((contract) => (
        <ContractListEntry
          key={contract.id}
          contract={contract}
          onPress={() => onPress(contract)}
        />
      ))}
    </>
  )
}
