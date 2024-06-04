// components/InputForms.tsx
import React, { useRef } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

interface InputFormsProps {
    functionInputRef: React.RefObject<HTMLInputElement>;
    intervalRef: React.RefObject<HTMLInputElement>;
    handleGraph: () => void;
    handleIntervalChange: () => void;
    intervalValue: number;
    setXMin: (value: number) => void;
    setXMax: (value: number) => void;
    setYMin: (value: number) => void;
    setYMax: (value: number) => void;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

const InputForms: React.FC<InputFormsProps> = ({
    functionInputRef,
    intervalRef,
    handleGraph,
    handleIntervalChange,
    intervalValue,
    setXMin,
    setXMax,
    setYMin,
    setYMax,
    xMin,
    xMax,
    yMin,
    yMax,
}) => {

    return (
        <div>
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
        </div>
    );
};

export default InputForms;
