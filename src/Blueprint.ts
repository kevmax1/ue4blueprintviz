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

            //todo parse pin data
            this._pins.push(new Pin({}));
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

    }

    class Pin implements IPin{
        private _data: {};

        constructor(parsedPin: {}){
            this._data = parsedPin;
        }
    }

    export type ParsedBlueprint = Array<{}>;

    interface IBlueprint{
        //new(parsedBP?: ParsedBlueprint);
        getSize(): BP_Size;
        getNodeByName(name: string): Node|void;
        getNodesByProperty(property: string): Node|void;
    }

    export class Blueprint implements IBlueprint{
        private _data: Node[];

        constructor(parsedBP: ParsedBlueprint){
            this._data = [];

            parsedBP.forEach((node) => {
                this._data.push(new Node(node));
            });

            console.group('Names');
            this._data.forEach((node) => {
                console.info(node.getName());
            });
            //console.groupEnd('Names');
            console.groupEnd();
        }

        getSize(){
            return {
                height: 0,
                width: 0
            }
        }

        getNodeByName(name: string): Node{
            return this._data[0];
        }

        getNodesByProperty(property: string): Node{
            return this._data[0];
        }
    }
}