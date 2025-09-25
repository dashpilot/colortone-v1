// presets.js - Film preset definitions

export const presets = [
    // Kodak Films
    {
        name: 'Portra 400',
        brand: 'Kodak',
        settings: {
            exposure: 0.1,
            contrast: -0.1,
            saturation: -0.2,
            temperature: 0.15,
            grain: 0.3,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 10],
                    [120, 100],
                    [255, 255],
                ],
                r: [
                    [0, 25],
                    [120, 115],
                    [255, 230],
                ],
                g: [
                    [0, 15],
                    [120, 120],
                    [255, 230],
                ],
                b: [
                    [0, 40],
                    [120, 90],
                    [255, 220],
                ],
            },
        },
    },
    {
        name: 'Portra 160',
        brand: 'Kodak',
        settings: {
            exposure: 0.05,
            contrast: -0.15,
            saturation: -0.1,
            temperature: 0.1,
            grain: 0.2,
            vignette: 0.15,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 110],
                    [255, 255],
                ],
                r: [
                    [0, 20],
                    [128, 125],
                    [255, 240],
                ],
                g: [
                    [0, 15],
                    [128, 120],
                    [255, 235],
                ],
                b: [
                    [0, 30],
                    [128, 105],
                    [255, 225],
                ],
            },
        },
    },
    {
        name: 'Portra 800',
        brand: 'Kodak',
        settings: {
            exposure: 0.15,
            contrast: 0.0,
            saturation: -0.15,
            temperature: 0.2,
            grain: 0.4,
            vignette: 0.25,
            curves: {
                rgb: [
                    [0, 15],
                    [128, 110],
                    [255, 255],
                ],
                r: [
                    [0, 30],
                    [128, 135],
                    [255, 235],
                ],
                g: [
                    [0, 20],
                    [128, 115],
                    [255, 225],
                ],
                b: [
                    [0, 35],
                    [128, 95],
                    [255, 215],
                ],
            },
        },
    },
    {
        name: 'Ektar 100',
        brand: 'Kodak',
        settings: {
            exposure: 0,
            contrast: 0.3,
            saturation: 0.4,
            temperature: 0.1,
            grain: 0.1,
            vignette: 0.15,
            curves: {
                rgb: [
                    [0, 0],
                    [120, 110],
                    [255, 255],
                ],
                r: [
                    [0, 10],
                    [120, 140],
                    [255, 255],
                ],
                g: [
                    [0, 10],
                    [120, 120],
                    [255, 245],
                ],
                b: [
                    [0, 20],
                    [120, 90],
                    [255, 235],
                ],
            },
        },
    },
    {
        name: 'Gold 200',
        brand: 'Kodak',
        settings: {
            exposure: 0.1,
            contrast: 0.1,
            saturation: 0.1,
            temperature: 0.2,
            grain: 0.3,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 0],
                    [128, 118],
                    [255, 255],
                ],
                r: [
                    [0, 20],
                    [128, 150],
                    [255, 255],
                ],
                g: [
                    [0, 10],
                    [128, 110],
                    [255, 240],
                ],
                b: [
                    [0, 30],
                    [128, 100],
                    [255, 210],
                ],
            },
        },
    },
    {
        name: 'ColorPlus 200',
        brand: 'Kodak',
        settings: {
            exposure: 0.05,
            contrast: 0.05,
            saturation: 0.05,
            temperature: 0.15,
            grain: 0.35,
            vignette: 0.25,
            curves: {
                rgb: [
                    [0, 0],
                    [128, 118],
                    [255, 250],
                ],
                r: [
                    [0, 15],
                    [128, 140],
                    [255, 250],
                ],
                g: [
                    [0, 10],
                    [128, 115],
                    [255, 240],
                ],
                b: [
                    [0, 25],
                    [128, 105],
                    [255, 220],
                ],
            },
        },
    },
    {
        name: 'Tri-X 400',
        brand: 'Kodak',
        settings: {
            exposure: 0.05,
            contrast: 0.5,
            saturation: -1,
            temperature: 0,
            grain: 0.7,
            vignette: 0.3,
            curves: {
                rgb: [
                    [0, 10],
                    [64, 40],
                    [192, 220],
                    [255, 255],
                ],
                r: [
                    [0, 10],
                    [255, 255],
                ],
                g: [
                    [0, 10],
                    [255, 255],
                ],
                b: [
                    [0, 10],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'T-Max 400',
        brand: 'Kodak',
        settings: {
            exposure: 0,
            contrast: 0.4,
            saturation: -1,
            temperature: 0,
            grain: 0.45,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 5],
                    [90, 70],
                    [170, 200],
                    [255, 255],
                ],
                r: [
                    [0, 5],
                    [255, 255],
                ],
                g: [
                    [0, 5],
                    [255, 255],
                ],
                b: [
                    [0, 5],
                    [255, 255],
                ],
            },
        },
    },

    // Fujifilm
    {
        name: 'Provia 100F',
        brand: 'Fujifilm',
        settings: {
            exposure: 0,
            contrast: 0.2,
            saturation: 0.1,
            temperature: -0.1,
            grain: 0.2,
            vignette: 0.1,
            curves: {
                rgb: [
                    [0, 0],
                    [128, 128],
                    [255, 255],
                ],
                r: [
                    [0, 0],
                    [128, 128],
                    [255, 250],
                ],
                g: [
                    [0, 0],
                    [128, 135],
                    [255, 255],
                ],
                b: [
                    [0, 10],
                    [128, 140],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Velvia 50',
        brand: 'Fujifilm',
        settings: {
            exposure: -0.1,
            contrast: 0.4,
            saturation: 0.5,
            temperature: -0.1,
            grain: 0.1,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 0],
                    [128, 130],
                    [255, 255],
                ],
                r: [
                    [0, 10],
                    [128, 150],
                    [255, 255],
                ],
                g: [
                    [0, 0],
                    [128, 140],
                    [255, 255],
                ],
                b: [
                    [0, 20],
                    [128, 120],
                    [255, 235],
                ],
            },
        },
    },
    {
        name: 'Acros 100',
        brand: 'Fujifilm',
        settings: {
            exposure: 0,
            contrast: 0.3,
            saturation: -1,
            temperature: 0,
            grain: 0.3,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 0],
                    [90, 80],
                    [170, 190],
                    [255, 255],
                ],
                r: [
                    [0, 0],
                    [255, 255],
                ],
                g: [
                    [0, 0],
                    [255, 255],
                ],
                b: [
                    [0, 0],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Classic Chrome',
        brand: 'Fujifilm',
        settings: {
            exposure: 0,
            contrast: 0.1,
            saturation: -0.2,
            temperature: 0,
            grain: 0.2,
            vignette: 0.15,
            curves: {
                rgb: [
                    [0, 10],
                    [128, 118],
                    [255, 240],
                ],
                r: [
                    [0, 20],
                    [128, 130],
                    [255, 225],
                ],
                g: [
                    [0, 10],
                    [128, 120],
                    [255, 230],
                ],
                b: [
                    [0, 20],
                    [128, 110],
                    [255, 220],
                ],
            },
        },
    },
    {
        name: 'Superia 400',
        brand: 'Fujifilm',
        settings: {
            exposure: 0.1,
            contrast: 0.15,
            saturation: 0.15,
            temperature: -0.05,
            grain: 0.35,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 0],
                    [128, 125],
                    [255, 255],
                ],
                r: [
                    [0, 10],
                    [128, 135],
                    [255, 255],
                ],
                g: [
                    [0, 0],
                    [128, 130],
                    [255, 245],
                ],
                b: [
                    [0, 15],
                    [128, 135],
                    [255, 240],
                ],
            },
        },
    },
    {
        name: 'Superia 800',
        brand: 'Fujifilm',
        settings: {
            exposure: 0.15,
            contrast: 0.2,
            saturation: 0.1,
            temperature: -0.1,
            grain: 0.45,
            vignette: 0.25,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 125],
                    [255, 255],
                ],
                r: [
                    [0, 15],
                    [128, 140],
                    [255, 250],
                ],
                g: [
                    [0, 5],
                    [128, 125],
                    [255, 245],
                ],
                b: [
                    [0, 20],
                    [128, 140],
                    [255, 250],
                ],
            },
        },
    },
    {
        name: 'Pro 400H',
        brand: 'Fujifilm',
        settings: {
            exposure: 0.05,
            contrast: -0.05,
            saturation: -0.1,
            temperature: -0.05,
            grain: 0.3,
            vignette: 0.15,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 120],
                    [255, 250],
                ],
                r: [
                    [0, 15],
                    [128, 130],
                    [255, 250],
                ],
                g: [
                    [0, 5],
                    [128, 125],
                    [255, 245],
                ],
                b: [
                    [0, 10],
                    [128, 130],
                    [255, 255],
                ],
            },
        },
    },

    // Other Films
    {
        name: 'Cinestill 800T',
        brand: 'Cinestill',
        settings: {
            exposure: 0.1,
            contrast: 0.1,
            saturation: -0.1,
            temperature: -0.3,
            grain: 0.4,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 125],
                    [255, 255],
                ],
                r: [
                    [0, 10],
                    [128, 120],
                    [255, 245],
                ],
                g: [
                    [0, 10],
                    [128, 115],
                    [255, 240],
                ],
                b: [
                    [0, 10],
                    [128, 140],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Ilford HP5',
        brand: 'Ilford',
        settings: {
            exposure: 0.05,
            contrast: 0.35,
            saturation: -1,
            temperature: 0,
            grain: 0.6,
            vignette: 0.25,
            curves: {
                rgb: [
                    [0, 5],
                    [85, 55],
                    [170, 200],
                    [255, 255],
                ],
                r: [
                    [0, 5],
                    [255, 255],
                ],
                g: [
                    [0, 5],
                    [255, 255],
                ],
                b: [
                    [0, 5],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Ilford Delta 3200',
        brand: 'Ilford',
        settings: {
            exposure: 0.15,
            contrast: 0.45,
            saturation: -1,
            temperature: 0,
            grain: 0.8,
            vignette: 0.3,
            curves: {
                rgb: [
                    [0, 15],
                    [70, 30],
                    [180, 210],
                    [255, 255],
                ],
                r: [
                    [0, 15],
                    [255, 255],
                ],
                g: [
                    [0, 15],
                    [255, 255],
                ],
                b: [
                    [0, 15],
                    [255, 255],
                ],
            },
        },
    },

    // Cinematic Looks
    // Cinema Film Stocks
    {
        name: 'Kodak Vision3 500T',
        brand: 'Cinema',
        settings: {
            exposure: 0.05,
            contrast: 0.2,
            saturation: 0.1,
            temperature: -0.15,
            grain: 0.25,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 125],
                    [255, 250],
                ],
                r: [
                    [0, 15],
                    [128, 135],
                    [255, 245],
                ],
                g: [
                    [0, 15],
                    [128, 130],
                    [255, 240],
                ],
                b: [
                    [0, 5],
                    [128, 140],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Kodak Vision3 200T',
        brand: 'Cinema',
        settings: {
            exposure: 0,
            contrast: 0.15,
            saturation: 0.05,
            temperature: -0.1,
            grain: 0.2,
            vignette: 0.15,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 128],
                    [255, 250],
                ],
                r: [
                    [0, 10],
                    [128, 130],
                    [255, 250],
                ],
                g: [
                    [0, 10],
                    [128, 125],
                    [255, 245],
                ],
                b: [
                    [0, 5],
                    [128, 135],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Kodak Vision3 50D',
        brand: 'Cinema',
        settings: {
            exposure: -0.05,
            contrast: 0.25,
            saturation: 0.15,
            temperature: 0.05,
            grain: 0.15,
            vignette: 0.15,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 130],
                    [255, 250],
                ],
                r: [
                    [0, 10],
                    [128, 140],
                    [255, 255],
                ],
                g: [
                    [0, 5],
                    [128, 135],
                    [255, 250],
                ],
                b: [
                    [0, 15],
                    [128, 125],
                    [255, 240],
                ],
            },
        },
    },
    {
        name: 'ARRI LogC',
        brand: 'Cinema',
        settings: {
            exposure: 0.1,
            contrast: 0.3,
            saturation: 0.1,
            temperature: 0,
            grain: 0.1,
            vignette: 0.1,
            curves: {
                rgb: [
                    [0, 5],
                    [64, 30],
                    [192, 225],
                    [255, 250],
                ],
                r: [
                    [0, 5],
                    [128, 135],
                    [255, 250],
                ],
                g: [
                    [0, 5],
                    [128, 135],
                    [255, 250],
                ],
                b: [
                    [0, 5],
                    [128, 135],
                    [255, 250],
                ],
            },
        },
    },
    // Teal & Orange preset
    {
        name: 'Teal & Orange',
        brand: 'Cinematic',
        settings: {
            exposure: 0,
            contrast: 0.3,
            saturation: 0.2,
            temperature: 0.1,
            grain: 0.2,
            vignette: 0.3,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 128],
                    [255, 250],
                ],
                r: [
                    [0, 20],
                    [64, 60],
                    [192, 220],
                    [255, 255],
                ],
                g: [
                    [0, 10],
                    [64, 50],
                    [192, 210],
                    [255, 245],
                ],
                b: [
                    [0, 30],
                    [64, 90],
                    [192, 220],
                    [255, 255],
                ],
            },
        },
    },

    // Cinestill 800T preset
    {
        name: 'Cinestill 800T',
        brand: 'Cinestill',
        settings: {
            exposure: 0.1,
            contrast: 0.1,
            saturation: -0.1,
            temperature: -0.3,
            grain: 0.4,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 125],
                    [255, 255],
                ],
                r: [
                    [0, 10],
                    [128, 120],
                    [255, 245],
                ],
                g: [
                    [0, 10],
                    [128, 115],
                    [255, 240],
                ],
                b: [
                    [0, 10],
                    [128, 140],
                    [255, 255],
                ],
            },
        },
    },

    // Blockbuster preset
    {
        name: 'Blockbuster',
        brand: 'Cinematic',
        settings: {
            exposure: 0.05,
            contrast: 0.4,
            saturation: 0.3,
            temperature: 0,
            grain: 0.15,
            vignette: 0.35,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 125],
                    [255, 250],
                ],
                r: [
                    [0, 10],
                    [64, 70],
                    [192, 215],
                    [255, 255],
                ],
                g: [
                    [0, 15],
                    [64, 65],
                    [192, 200],
                    [255, 240],
                ],
                b: [
                    [0, 20],
                    [64, 50],
                    [192, 195],
                    [255, 240],
                ],
            },
        },
    },

    // Popular Cinematic Looks
    {
        name: 'Blade Runner 2049',
        brand: 'Cinematic',
        settings: {
            exposure: 0,
            contrast: 0.35,
            saturation: -0.1,
            temperature: -0.2,
            grain: 0.2,
            vignette: 0.4,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 120],
                    [255, 250],
                ],
                r: [
                    [0, 10],
                    [128, 140],
                    [255, 245],
                ],
                g: [
                    [0, 10],
                    [128, 120],
                    [255, 235],
                ],
                b: [
                    [0, 5],
                    [128, 150],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Mad Max',
        brand: 'Cinematic',
        settings: {
            exposure: 0.1,
            contrast: 0.4,
            saturation: 0.2,
            temperature: 0.3,
            grain: 0.3,
            vignette: 0.3,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 120],
                    [255, 245],
                ],
                r: [
                    [0, 10],
                    [128, 160],
                    [255, 255],
                ],
                g: [
                    [0, 15],
                    [128, 140],
                    [255, 235],
                ],
                b: [
                    [0, 25],
                    [128, 90],
                    [255, 200],
                ],
            },
        },
    },
    {
        name: 'Wes Anderson',
        brand: 'Cinematic',
        settings: {
            exposure: 0.05,
            contrast: 0.15,
            saturation: 0.2,
            temperature: 0.1,
            grain: 0.25,
            vignette: 0.15,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 140],
                    [255, 250],
                ],
                r: [
                    [0, 10],
                    [128, 150],
                    [255, 250],
                ],
                g: [
                    [0, 15],
                    [128, 140],
                    [255, 240],
                ],
                b: [
                    [0, 20],
                    [128, 120],
                    [255, 210],
                ],
            },
        },
    },
    {
        name: 'Fincher',
        brand: 'Cinematic',
        settings: {
            exposure: -0.05,
            contrast: 0.3,
            saturation: -0.1,
            temperature: -0.1,
            grain: 0.15,
            vignette: 0.3,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 115],
                    [255, 250],
                ],
                r: [
                    [0, 10],
                    [128, 115],
                    [255, 240],
                ],
                g: [
                    [0, 10],
                    [128, 115],
                    [255, 245],
                ],
                b: [
                    [0, 5],
                    [128, 130],
                    [255, 255],
                ],
            },
        },
    },
    {
        name: 'Nolan',
        brand: 'Cinematic',
        settings: {
            exposure: 0,
            contrast: 0.25,
            saturation: -0.05,
            temperature: 0,
            grain: 0.1,
            vignette: 0.2,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 120],
                    [255, 250],
                ],
                r: [
                    [0, 10],
                    [128, 125],
                    [255, 245],
                ],
                g: [
                    [0, 10],
                    [128, 125],
                    [255, 245],
                ],
                b: [
                    [0, 10],
                    [128, 125],
                    [255, 245],
                ],
            },
        },
    },
    {
        name: 'Mexico Filter',
        brand: 'Cinematic',
        settings: {
            exposure: 0,
            contrast: 0.3,
            saturation: 0.1,
            temperature: 0.3,
            grain: 0.2,
            vignette: 0.3,
            curves: {
                rgb: [
                    [0, 5],
                    [128, 120],
                    [255, 240],
                ],
                r: [
                    [0, 10],
                    [128, 150],
                    [255, 255],
                ],
                g: [
                    [0, 15],
                    [128, 130],
                    [255, 230],
                ],
                b: [
                    [0, 30],
                    [128, 90],
                    [255, 190],
                ],
            },
        },
    },
];
