/// <reference path="Parser.ts" />
/// <reference path="Drawing.ts" />

module UE4Lib{

    export function parseBlueprint(markup): Array<{}>{
        var parser = new Parser(markup);
        var nodes = [];
        var node = {};

        //iterate through the blueprint
        while(!parser.isEOF()){

            if(parser.line().getIndentation() === 0 && parser.line().isClassStartTag()) {
                var name = parser.line().getValueFor('Name');
                var _class = parser.line().getValueFor('Class');
                node = {};
                node[_class] = parser.parseBlock();
                node[_class].Name = name;
                nodes.push(node);
            }

            parser.next();
        }

        if(parser.isMalformed())
            nodes = [];

        return nodes;
    }
}
