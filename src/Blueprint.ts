module UE4Lib{
    'use strict';

    interface BP_Size{
        height: number;
        width: number;
    }

    interface BP_Pos{
        x: number;
        y: number;
    }

    interface INode{

    }

    class Node implements INode{
        private _data;
        private _pins: Pin[] = [];

        constructor(data){
            this._data = data;

            //filter pins
            var attributes = Object.keys(this._data);
            attributes.forEach((attr: string) => {
                if(attr.indexOf('EdGraphPin_') !== -1){
                    this._pins.push(new Pin(this._data[attr]));
                }
            });

            //todo parse pin data
            //this._pins.push(new Pin({}));
        }

        getProperty(name: string): any{
            if(name in this._data)
                return this._data[name];

            return null;
        }

        getName(): string{
            return this.getProperty('Name');
        }

        getClass(): string{
            return this.getProperty('Class');
        }
    }

    interface IPin{
        getProperty(property: string): any;
        isInput(): boolean;
        isOutput(): boolean;
        isHidden(): boolean;
        isConnected(): boolean;
    }

    class Pin implements IPin{
        private _data: {};

        constructor(parsedPin: {}){
            this._data = parsedPin;
        }

        getProperty(property: string): any{
            if(property in this._data)
                return this._data[property];

            return false;
        }

        isInput(): boolean{
            return !this.isOutput();
        }

        isOutput(): boolean{
            var direction = this.getProperty('Direction');

            if(direction !== false && direction === 'EGPD_Output')
                return true;

            return false;
        }

        isHidden(): boolean{
            var hidden = this.getProperty('bHidden');

            if(hidden !== false && hidden === 'True')
                return true;

            return false;
        }

        isConnected(): boolean{
            //todo
            return true;
        }
    }

    export type ParsedBlueprint = Array<{}>;

    interface IBlueprint{
        //new(parsedBP?: ParsedBlueprint);
        getSize(): BP_Size;
        getNodeByName(name: string): Node|void;
        getNodeByPin(pinName: string): Node|void;
        getNodesByClass(classType: string): Node[]|void;
        getNodesByProperty(property: string): Node[]|void;
    }

    export class Blueprint implements IBlueprint{
        private _data: Node[];

        constructor(parsedBP: ParsedBlueprint){
            this._data = [];

            parsedBP.forEach((node) => {
                this._data.push(new Node(node));
            });

            /*console.group('Names');
             this._data.forEach((node) => {
             console.info(node.getName());
             });
             console.groupEnd();*/
        }

        getSize(){
            return {
                height: 0,
                width: 0
            }
        }

        getNodeByName(name: string): Node|void{
            var match: Node = null;

            this._data.forEach((node: Node) => {
                if(node.getName() === name)
                    match = node;
            });

            return match;
        }

        getNodesByClass(classType: string): Node[]|void{
            var nodes: Node[];

            nodes = this._data.filter((node: Node) => {
                return (node.getClass() === classType) ? true : false;
            });

            return nodes;
        }

        getNodesByProperty(property: string): Node[]|void{
            var filteredNodes: Node[] = [];

            this._data.forEach((node: Node) => {
                if(node.getProperty(property) !== null)
                    filteredNodes.push(node);
            });

            return filteredNodes;
        }

        //todo
        getNodeByPin(pinName: string): Node|void{
            return null;
        }

        //@debug
        printNodeClasses(): void{
            /*var classes = new Set();

             this._data.forEach((node: Node) => {
             classes.add(node.getClass());
             });

             classes.forEach((_class) => {
             console.log(_class);
             });*/
        }
    }
}
