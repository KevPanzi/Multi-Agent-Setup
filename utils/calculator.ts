export interface CalculatorState {
  display: string
  previousValue: number | null
  operation: string | null
  waitingForOperand: boolean
}

export function calculate(state: CalculatorState): number {
  const { display, previousValue, operation } = state
  
  if (previousValue === null || !operation) {
    return parseFloat(display) || 0
  }
  
  const currentValue = parseFloat(display) || 0
  
  switch (operation) {
    case '+':
      return previousValue + currentValue
    case '-':
      return previousValue - currentValue
    case '*':
      return previousValue * currentValue
    case '/':
      if (currentValue === 0) {
        return Infinity // Return Infinity for divide by zero
      }
      return previousValue / currentValue
    default:
      return currentValue
  }
}
