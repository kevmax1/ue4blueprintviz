/// <reference path="Blueprint.ts" />

module UE4Lib{
    'use strict';

    //SetColorAndOpacity

    var gridSize = 16;
    const BRANDING_TEXT = 'BLUEPRINT';

    export class GridColor {
        static background: string = '#2A2A2A';
        static primaryLine: string = '#353535';
        static secondaryLine: string = '#1C1C1C';
        static axis: string = '#000000';
    }

    interface DrawGridLineParams {
        ctx: CanvasRenderingContext2D;
        color: string;
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
    }
    function drawGridLine(params: DrawGridLineParams) : void {
        var ctx = params.ctx;

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(params.fromX, params.fromY);
        ctx.lineTo(params.toX, params.toY);
        ctx.strokeStyle = params.color;
        ctx.stroke();
    }

    export function drawGrid(container: HTMLElement, blueprint: Blueprint): void {
        var size = blueprint.getSize();
        var offset = blueprint.getOffset();
        console.log(blueprint.getSize());

        var canvas: HTMLCanvasElement = <HTMLCanvasElement>container.getElementsByClassName('grid')[0];
        var ctx = canvas.getContext('2d');

        canvas.width = size.width;
        canvas.height = size.height;
        canvas.style.width = size.width + 'px';
        canvas.style.height = size.height + 'px';

        ctx.globalCompositeOperation = 'normal';
        ctx.fillStyle = GridColor.background;
        ctx.fillRect(10, 10, 100, 100);

        //draw small grid
        for(var i=1; i<canvas.width; i++){
            if(i % gridSize === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.primaryLine,
                    fromX: i,
                    fromY: 0,
                    toX: i,
                    toY: canvas.height
                });
            }
        }

        for(var i=1; i<canvas.height; i++){
            if(i % gridSize === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.primaryLine,
                    fromX: 0,
                    fromY: i,
                    toX: canvas.width,
                    toY: i
                });
            }
        }

        //draw big grid
        for(var i=1; i<canvas.width; i++){
            if(i % (gridSize * 8) === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.secondaryLine,
                    fromX: i,
                    fromY: 0,
                    toX: i,
                    toY: canvas.height
                });
            }
        }

        for(var i=1; i<canvas.height; i++){
            if(i % (gridSize * 8) === 0){
                drawGridLine({
                    ctx: ctx,
                    color: GridColor.secondaryLine,
                    fromX: 0,
                    fromY: i,
                    toX: canvas.width,
                    toY: i
                });
            }
        }

        //draw x axis
        if(offset.y <=0 && offset.y + size.height >= 0){
            console.warn('drawing x axis');
            drawGridLine({
                ctx: ctx,
                color: GridColor.axis,
                fromX: 0,
                fromY: (offset.y * -1),
                toX: canvas.width,
                toY: (offset.y * -1)
            });
        }

        //draw y axis
        if(offset.x <= 0 && offset.x + size.width >= 0){
            console.warn('drawing y axis');
            drawGridLine({
                ctx: ctx,
                color: GridColor.axis,
                fromX: (offset.x * -1),
                fromY: 0,
                toX: (offset.x * -1),
                toY: canvas.height
            });
        }
    }

    export function drawNodes(container: HTMLElement, blueprint: Blueprint): void {
        var nodes = blueprint.getNodes();

        nodes.forEach(function(node: Node){
            if(node.getClass() === 'EdGraphNode_Comment'){
                createEdGraphNode_Comment(container, node);
            }
        });
    }

    export function createEdGraphNode_Comment(container: HTMLElement, node: Node): void {
        var size = node.getSize();
        var position = node.getPosition();
        var div = document.createElement('div');

        div.style.width = size.width + 'px';
        div.style.height = size.height + 'px';
        div.style.position = 'relative';
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';
        div.style.backgroundColor = node.getCommentColorAsCSS();
        div.style.transform = 'translate(' + 512 + 'px,' + 256 + 'px)'; //todo add dynamic offset

        container.getElementsByClassName('nodes')[0].appendChild(div);
    }

    export function initContainer(container: HTMLElement) {
        var brandingEl: HTMLElement = document.createElement('div');
        var gridEl: HTMLCanvasElement = document.createElement('canvas');
        var linesEl: SVGElement = <SVGElement>document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var nodesEl: HTMLElement = document.createElement('div');

        container.innerHTML = '';
        container.className = 'blueprint-view';

        gridEl.className = 'grid';
        container.appendChild(gridEl);

        linesEl.setAttribute('class', 'lines');
        container.appendChild(linesEl);

        nodesEl.className = 'nodes';
        container.appendChild(nodesEl);

        brandingEl.innerHTML = BRANDING_TEXT;
        brandingEl.className = 'branding';
        container.appendChild(brandingEl);
    }
}
