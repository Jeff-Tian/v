import crop from '../../src/image-decorators/crop';

describe('crop', () => {
    it('contains getPanRange', () => {
        expect(crop.getPanRange).toBeDefined();
    });

    it('getPanRange for non rotated image', () => {
        let image = {
            naturalHeight: 500,
            naturalWidth: 300
        };

        expect(crop.getPanRange(image)).toEqual({
            x: 0,
            y: 100
        });

        image = {
            naturalHeight: 200,
            naturalWidth: 600
        };

        expect(crop.getPanRange(image)).toEqual({
            x: 200,
            y: 0
        });

        image = {
            naturalHeight: 100,
            naturalWidth: 100
        };

        expect(crop.getPanRange(image)).toEqual({
            x: 0, y: 0
        });
    });

    it('getPanRange for rotated image', () => {
        let image = {
            naturalHeight: 500,
            naturalWidth: 300
        };

        expect(crop.getPanRange(image, -90)).toEqual({
            x: 100, y: 0
        });

        expect(crop.getPanRange(image, -270)).toEqual({
            x: 100, y: 0
        });

        expect(crop.getPanRange(image, -180)).toEqual({
            x: 0, y: 100
        });
    });
});