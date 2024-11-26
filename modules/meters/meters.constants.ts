import { Dimensions } from 'react-native'

const windowWidth = Dimensions.get('window').width
const horizontalPadding = 16

export const CELL_AMOUNT_OF_COLUMNS = 2
export const CELL_GAP = 8

export const cellHeight = 96 - CELL_GAP / 2
export const cellWidth =
  (windowWidth - horizontalPadding * 2) / CELL_AMOUNT_OF_COLUMNS - CELL_GAP / 2

export function getCellPositionFromIndex(index: number) {
  'worklet'
  return {
    x: index ? (index % CELL_AMOUNT_OF_COLUMNS) * (cellWidth + CELL_GAP) : 0,
    y: index ? Math.floor(index / CELL_AMOUNT_OF_COLUMNS) * (cellHeight + CELL_GAP) : 0,
  }
}

export function getCellContainerHeight(cellAmount: number) {
  const gapHeights = (Math.ceil(cellAmount / CELL_AMOUNT_OF_COLUMNS) - 1) * CELL_GAP
  return Math.ceil(cellAmount / CELL_AMOUNT_OF_COLUMNS) * cellHeight + gapHeights
}

export function getCellIndexFromPosition(x: number, y: number) {
  'worklet'
  const column = Math.max(0, Math.floor((x + cellWidth / 3) / (cellWidth + CELL_GAP)))
  const row = Math.max(0, Math.floor((y + cellHeight / 3) / (cellHeight + CELL_GAP)))
  return row * CELL_AMOUNT_OF_COLUMNS + column
}
