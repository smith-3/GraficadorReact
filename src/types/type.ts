// types.ts
export interface Plot {
    id: number;
    formula: string;
    color: string;
}

export interface ChartData {
    labels: number[];
    datasets: {
        label: string;
        data: { x: number; y: number }[];
        borderColor: string;
        fill: boolean;
        tension: number;
        pointRadius: number;
    }[];
}
