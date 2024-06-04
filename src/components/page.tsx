'use client'
import React, { useState, useRef } from 'react';
import { TextField, Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, Title, Tooltip, Legend, LineController, PointElement, LineElement } from 'chart.js';
import { create, all } from 'mathjs';
import Head from 'next/head';

Chart.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineController,
  PointElement,
  LineElement
);

const math = create(all);

export default function Home() {
  const functionInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [plots, setPlots] = useState<{ id: number; formula: string; color: string }[]>([]);
  const [intervalValue, setIntervalValue] = useState<number>(0.5); // Valor por defecto del intervalo
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [yMin, setYMin] = useState<number>(-10);
  const [yMax, setYMax] = useState<number>(10);

  const handleGraph = () => {
    const functionInput = functionInputRef.current?.value.trim();

    if (!functionInput) {
      setError('Error: Debes ingresar una función.');
      return;
    }

    setError(null);

    try {
      math.evaluate('f(x) = ' + functionInput); // Intentar parsear la función
      const currentId = plots.length > 0 ? plots[plots.length - 1].id + 1 : 0;
      const color = '#' + ((Math.random() * 0xffffff) << 0).toString(16); // Generar un color aleatorio
      setPlots([...plots, { id: currentId, formula: functionInput, color }]);
      functionInputRef.current!.value = ''; // Vaciar el input después de graficar
    } catch (error: any) {
      setError(`Error: ${error.message}`);
    }
  };

  const handleEditFormula = (id: number, newFormula: string) => {
    const updatedPlots = plots.map((plot) =>
      plot.id === id ? { ...plot, formula: newFormula } : plot
    );
    setPlots(updatedPlots);
  };

  const handleDeletePlot = (id: number) => {
    const remainingPlots = plots.filter((plot) => plot.id !== id);
    setPlots(remainingPlots);
  };

  const handleColorChange = (id: number) => {
    const updatedPlots = plots.map((plot) =>
      plot.id === id ? { ...plot, color: handleColor().color } : plot
    );
    setPlots(updatedPlots);
  };

  const handleColor = () => {
    return { color: '#' + ((Math.random() * 0xffffff) << 0).toString(16) };
  };

  const handleIntervalChange = () => {
    const interval = parseFloat(intervalRef.current?.value || '0.5');
    if (!isNaN(interval) && interval > 0) {
      setIntervalValue(interval);
    }
  };

  const generateData = (formula: string) => {
    const data = [];
    const modifiedFormula = formula.replace(/ln/g, 'log');
    for (let x = xMin; x <= xMax; x += intervalValue) {
      try {
        const scope = { x };
        let y = math.evaluate(modifiedFormula, scope);
        if (!isFinite(y)) {
          throw new Error('Value is not finite');
        }
        data.push({ x, y });
        console.log(x,y)
      } catch (error) {
        console.error(`Error evaluating formula at x=${x}: ${error}`);
        // No hacer push de valores no válidos
      }
    }
    return data;
  };
  

  const generateLabels = () => {
    const labels = [];
    for (let x = xMin; x <= xMax; x += intervalValue) {
      labels.push(x);
    }
    return labels;
  };

  const chartData = {
    labels: generateLabels(),
    datasets: plots.map((plot) => ({
      label: plot.formula,
      data: generateData(plot.formula),
      borderColor: plot.color,
      fill: false,
      tension: 0.1,
      pointRadius: 5,
    })),
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'X',
        },
        min: xMin, // Límite mínimo del eje X
        max: xMax, // Límite máximo del eje X
      },
      y: {
        title: {
          display: true,
          text: 'Y',
        },
        min: yMin, // Límite mínimo del eje Y
        max: yMax, // Límite máximo del eje Y
      },
    },
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
    },
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (event.buttons !== 1) return; // Solo actúa si se mantiene presionado el botón izquierdo del ratón
    const movementX = event.movementX / 50; // Ajustar la velocidad de desplazamiento
    const movementY = event.movementY / 50; // Ajustar la velocidad de desplazamiento
    setXMin((prev) => Math.round(prev - movementX));
    setXMax((prev) => Math.round(prev - movementX));
    setYMin((prev) => Math.round(prev + movementY));
    setYMax((prev) => Math.round(prev + movementY));
  };

  return (
    <>
      <Head>
        <title>Graficador de Funciones</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen">
        {/* Barra lateral izquierda */}
        <aside className="w-1/4 bg-gray-100 p-4">
          <Typography variant="h6" gutterBottom>
            Funciones a graficar
          </Typography>
          <List>
            {plots.map((plot) => (
              <div key={plot.id}>
                <ListItem>
                  <ListItemText primary={
                    <TextField
                      value={plot.formula}
                      onChange={(e) => handleEditFormula(plot.id, e.target.value)}
                      variant="outlined"
                      fullWidth
                      placeholder="Ej. sin(x), cos(x), ln(x)"
                      className="mb-2"
                    />
                  } />
                  <Button onClick={() => handleColorChange(plot.id)} style={{ backgroundColor: plot.color, marginLeft: '8px' }}>{':3'}</Button>
                  <Button onClick={() => handleDeletePlot(plot.id)} style={{ marginLeft: '8px' }}>Eliminar</Button>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
          <form onSubmit={(e) => e.preventDefault()} className="mb-4 flex">
            <TextField
              id="functionInput"
              label="Ingresar función"
              inputRef={functionInputRef}
              variant="outlined"
              fullWidth
              placeholder="Ej. sin(x), cos(x), ln(x)"
              className="mb-2"
            />
            <Button variant="contained" color="primary" onClick={handleGraph} style={{ marginLeft: '8px' }}>
              Graficar
            </Button>
          </form>
          <form onSubmit={(e) => e.preventDefault()} className="mb-4 flex">
            <TextField
              id="intervalInput"
              label="Intervalo"
              inputRef={intervalRef}
              variant="outlined"
              fullWidth
              type="number"
              defaultValue={intervalValue.toString()}
              InputProps={{ inputProps: { min: 0.5, step: 0.5 } }}
              className="mb-2"
            />
            <Button variant="contained" color="primary" onClick={handleIntervalChange} style={{ marginLeft: '8px' }}>
              Aplicar
            </Button>
          </form>
          <div className="mb-4">
            <Typography variant="h6" gutterBottom>
              Límites de los ejes
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <TextField
                label="X Mínimo"
                type="number"
                value={xMin}
                onChange={(e) => setXMin(Math.round(Number(e.target.value)))}
                variant="outlined"
                fullWidth
                className="mr-2"
              />
              <TextField
                label="X Máximo"
                type="number"
                value={xMax}
                onChange={(e) => setXMax(Math.round(Number(e.target.value)))}
                variant="outlined"
                fullWidth
                className="ml-2"
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <TextField
                label="Y Mínimo"
                type="number"
                value={yMin}
                onChange={(e) => setYMin(Math.round(Number(e.target.value)))}
                variant="outlined"
                fullWidth
                className="mr-2"
              />
              <TextField
                label="Y Máximo"
                type="number"
                value={yMax}
                onChange={(e) => setYMax(Math.round(Number(e.target.value)))}
                variant="outlined"
                fullWidth
                className="ml-2"
              />
            </Box>
          </div>
          {error && <Typography variant="body2" color="error">{error}</Typography>}
        </aside>

        <section onMouseMove={handleMouseMove} className="flex-1 flex flex-col items-center justify-center bg-gray-200 p-4 rounded-lg shadow-lg">
          <Paper elevation={3} className="w-full h-full p-4 rounded-lg shadow-lg">
            <Line data={chartData} options={options} height={0} />
          </Paper>
        </section>
      </main>
    </>
  );
}
