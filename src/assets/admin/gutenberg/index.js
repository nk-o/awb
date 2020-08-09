import './editor.scss';

import * as block from './block';
import './block-spacings';
import './ghostkit-grid-extension';

const {
    jQuery: $,
} = window;

const {
    registerBlockType,
} = wp.blocks;

$( () => {
    registerBlockType( block.name, block.settings );
} );
