// src/components/StockDailyCount.jsx
import React from 'react'
import { useStock } from '../contexts/StockContext'    // ou useStockMovement, se você criou o contexto separado
import { Button } from '@mui/material'

export default function StockDailyCount({ parsedCounts }) {
  const { dailyCount } = useStock()                     // ou useStockMovement()

  const handleSubmit = async () => {
    try {
      await dailyCount(parsedCounts)
      alert('Contagem importada e estoque atualizado!')
    } catch (err) {
      console.error(err)
      alert('Erro ao processar contagem')
    }
  }

  return (
    <Button variant="contained" onClick={handleSubmit}>
      Confirmar Contagem Diária
    </Button>
  )
}
