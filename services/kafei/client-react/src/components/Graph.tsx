import React, { useEffect, useRef, useState } from 'react';
import { Chart, ChartData, ChartType } from 'chart.js';
import { ScopedFetch } from '../control/Netcode';
import { Statistics } from '../control/Types';

interface Props {
    net: ScopedFetch;
    title: string;
    source: string;
    chartType: ChartType;
    selector?: (e: any) => string;
    normalizer?: (e: string) => string;
};

export default function Graph(props: Props) {
    const chartElement = useRef<HTMLCanvasElement>(null);
    const [data, setData] = useState<ChartData>();
    const [chart, setChart] = useState<Chart>();
    const [total, setTotal] = useState<number>();

    useEffect(() => {
        (async () => {
            const stats = await props.net.fetch<Statistics[]>(props.source);

            if(!stats.data)
                return;
            
            const labels = stats.data.map(e => {
                if(e.architecture) return e.architecture;
                if(e.system) return e.system;
                if(e.item) return props.selector 
                    ? props.selector(e.item)
                    : e.item;
                return '[unknown]';
            });

            let normalizedValues = stats.data.map((e, i) => {
                return {
                    item: props.normalizer 
                        ? props.normalizer(labels[i]) : labels[i],
                    count: e.count
                };
            });
            const sortedValues: Map<string, number> = new Map<string, number>();
            normalizedValues.forEach(e => sortedValues.set(
                e.item,
                (sortedValues.get(e.item) ? sortedValues.get(e.item)! : 0) 
                + e.count))
            normalizedValues = [];
            sortedValues.forEach((v, k) => normalizedValues.push(
                {item: k, count: v}));

            let newTotal = 0;

            normalizedValues.forEach(e => {
                newTotal += e.count;
            });

            setData({
                labels: normalizedValues.map(e => e.item),
                datasets: [
                    {
                        data: normalizedValues.map(e => e.count),
                        label: 'Count',
                    }
                ]
            });

            setTotal(newTotal);
        })();
    }, []);

    if(!chart && chartElement.current) {
        const canvas = chartElement.current.getContext('2d');

        if(canvas !== null && data) {
            setChart(new Chart(canvas, {
                data: data,
                type: props.chartType,
            }));
        }
    }

    return (
        <div className="ui raised card">
            <div className="image">
                <canvas style={{height: "40em"}} ref={chartElement}></canvas>
            </div>
            <div className="content">
                <p className="header">{props.title}</p>
                <div className="meta">
                    <span>{total} unique values</span>
                </div>
            </div>
        </div>
    );
};