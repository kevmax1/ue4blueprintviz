/// <reference path="Parser.ts" />

module UE4Lib{

    export function parseBlueprint(markup): Array<{}>{
        var parser = new Parser(markup);
        var nodes = [];
        var node = {};

        //iterate through the blueprint
        while(!parser.isEOF()){

            if(parser.line().getIndentation() === 0 && parser.line().isClassStartTag()) {
                var name = parser.line().getValueFor('Name');
                node = {};
                node[name] = parser.parseBlock();
                nodes.push(node);
            }

            parser.next();
        }

        if(parser.isMalformed())
            nodes = [];

        return nodes;
    }
}
