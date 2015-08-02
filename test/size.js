describe('Blueprint Size Calculation: Single Comment At Origin', function(){
    'uset strict';

    var blueprint;
    var size;
    var offset;

    beforeEach(function(){
        blueprint = UE4Lib.parseBlueprint(window.__html__['test/blueprints/size_comment1.txt']);
        size = blueprint.getSize();
        offset = blueprint.getOffset();
    });

    it('width', function(){
        expect(size.width).toEqual(256);
    });

    it('height', function(){
        expect(size.width).toEqual(128);
    });

    it('offset x', function(){
        expect(size.width).toEqual(0);
    });

    it('offset y', function(){
        expect(size.width).toEqual(0);
    });

});

describe('Blueprint Size Calculation: Single Comment Negative Offset', function(){
    'uset strict';

    var blueprint;
    var size;
    var offset;

    beforeEach(function(){
        blueprint = UE4Lib.parseBlueprint(window.__html__['test/blueprints/size_comment2.txt']);
        size = blueprint.getSize();
        offset = blueprint.getOffset();
    });

    it('width', function(){
        expect(size.width).toEqual(256);
    });

    it('height', function(){
        expect(size.width).toEqual(128);
    });

    it('offset x', function(){
        expect(size.width).toEqual(-256);
    });

    it('offset y', function(){
        expect(size.width).toEqual(128);
    });

});

describe('Blueprint Size Calculation: Single Comment Positive Offset', function(){
    'uset strict';

    var blueprint;
    var size;
    var offset;

    beforeEach(function(){
        blueprint = UE4Lib.parseBlueprint(window.__html__['test/blueprints/size_comment3.txt']);
        size = blueprint.getSize();
        offset = blueprint.getOffset();
    });

    it('width', function(){
        expect(size.width).toEqual(256);
    });

    it('height', function(){
        expect(size.width).toEqual(128);
    });

    it('offset x', function(){
        expect(size.width).toEqual(128);
    });

    it('offset y', function(){
        expect(size.width).toEqual(128);
    });

});

describe('2 Comments', function(){
    'uset strict';

    var blueprint;
    var size;
    var offset;

    beforeEach(function(){
        blueprint = UE4Lib.parseBlueprint(window.__html__['test/blueprints/size_comment4.txt']);
        size = blueprint.getSize();
        offset = blueprint.getOffset();
    });

    it('width', function(){
        expect(size.width).toEqual(512 + 128 + 256);
    });

    it('height', function(){
        expect(size.width).toEqual(256 + 128);
    });

    it('offset x', function(){
        expect(size.width).toEqual(-512);
    });

    it('offset y', function(){
        expect(size.width).toEqual(-256);
    });

});

describe('Blueprint Size Calculation: 1 Negative Comment - 1 Node', function(){
    'uset strict';

    var blueprint;
    var size;
    var offset;

    beforeEach(function(){
        blueprint = UE4Lib.parseBlueprint(window.__html__['test/blueprints/node_size1.txt']);
        size = blueprint.getSize();
        offset = blueprint.getOffset();
    });

    it('width', function(){
        expect(size.width).toEqual(640 + 256);
    });

    it('height', function(){
        expect(size.width).toEqual(512);
    });

    it('offset x', function(){
        expect(size.width).toEqual(-640);
    });

    it('offset y', function(){
        expect(size.width).toEqual(-256);
    });

});
