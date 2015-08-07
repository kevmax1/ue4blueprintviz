/// <reference path="Blueprint.ts" />

module UE4Lib{
    'use strict';

    //SetColorAndOpacity

    var gridSize = 16;
    const BRANDING_TEXT = 'BLUEPRINT VIEWER';

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
        ctx.translate(0.5,0.5); //for dat extra crisp grid

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

        ctx.translate(-0.5,-0.5); //for dat extra crisp grid
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#039EE5";
        ctx.beginPath();
        ctx.moveTo(42, 115);
        ctx.bezierCurveTo(221, 114, 231, 251, 400, 250);
        ctx.stroke();
    }

    export function drawNodes(container: HTMLElement, blueprint: Blueprint): void {
        var nodes = blueprint.getNodes();
        var offset = blueprint.getOffset();

        nodes.forEach(function(node: Node){
            if(node.getClass() === 'EdGraphNode_Comment'){
                let nodeEl: HTMLElement = createEdGraphNode_Comment(container, node);
                nodeEl.style.transform = 'translate(' + (offset.x * -1) + 'px,' + (offset.y * -1) + 'px)';
                container.getElementsByClassName('nodes')[0].appendChild(nodeEl);
            }
            else{
                let nodeEl: HTMLElement = createPlaceholderNode(container, node);
                nodeEl.style.transform = 'translate(' + (offset.x * -1) + 'px,' + (offset.y * -1) + 'px)';
                container.getElementsByClassName('nodes')[0].appendChild(nodeEl);
            }
        });
    }

    export function createEdGraphNode_Comment(container: HTMLElement, node: Node): HTMLElement {
        var size = node.getSize();
        var position = node.getPosition();
        var div = document.createElement('div');

        div.className = node.getClass();
        div.style.width = size.width + 'px';
        div.style.height = size.height + 'px';
        div.style.position = 'absolute';
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';
        div.style.backgroundColor = node.getCommentColorAsCSS();

        return div;
    }

    export function createPlaceholderNode(container: HTMLElement, node: Node): HTMLElement {
        var position = node.getPosition();
        var div = document.createElement('div');

        div.innerHTML = node.getClass();
        div.style.textAlign = 'center';
        div.style.lineHeight = '128px';
        div.className = node.getClass();
        div.style.width = '256px';
        div.style.height = '128px';
        div.style.position = 'absolute';
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';
        div.style.backgroundColor = '#4B6248';
        div.style.zIndex = '1';
        div.style.borderRadius = '16px';
        div.style.color = 'white';

        return div;
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
