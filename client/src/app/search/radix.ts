/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { logDebug } from '@/shared/utils/logging';

const MODULE = 'shared.utils.radix.'

class PrefixIdTreeNode {
    leaves: { [char: string]: PrefixIdTreeNode };
    end: boolean;
    ids: string[];

    constructor() {
        // Leaves from node
        this.leaves = {};
        this.end = false;
        this.ids = [];
    }

    // @return {boolean}
    containsKey(c: string) {
        return this.leaves[c] != null;
    }

    // @return {PrefixIdTreeNode}
    getNode(c: string) {
        return this.leaves[c];
    }

    // @return {void}
    putNode(c: string, node: PrefixIdTreeNode) {
        this.leaves[c] = node;
    }

    // @return {void}
    setEnd() {
        this.end = true;
    }

    // @return {boolean}
    isEnd() {
        return this.end;
    }

    getAllEnds(): PrefixIdTreeNode[] {
        const nodes: PrefixIdTreeNode[] = [];
        if (this.isEnd()) {
            nodes.push(this);
        }
        for (const key in this.leaves) {
            nodes.push(...this.leaves[key].getAllEnds());
        }
        return nodes;
    }
}

export class PrefixIdTree {

    rootNode: PrefixIdTreeNode;

    constructor() {
        this.rootNode = new PrefixIdTreeNode();
    }

    /**
     * Inserts a word into the tree
     * @return void
     * @param word that is inserted
     * @param id
     */
    insert(word: string, id: string) {
        let node = this.rootNode;
        const normalizedWord = word.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '')
        for (let i = 0; i < normalizedWord.length; i++) {
            const currentChar = normalizedWord.charAt(i);
            if (!node.containsKey(currentChar)) {
                node.putNode(currentChar, new PrefixIdTreeNode());
            }

            node = node.getNode(currentChar);
        }
        node.setEnd();
        node.ids.push(id);
    }

    /**
     * Searches for a word in the tree and returns an array of ids
     * related to the word
     *
     * @param {string} word
     * @return {string[]}
     */
    search(word: string): string[] {
        const fName = MODULE + this.search.name
        if (!word || word.length === 0) {
            logDebug(fName, 'empty string');
            return [];
        }

        let node = this.rootNode;
        const normalizedWord = word.toLowerCase().trim();
        for (let i = 0; i < normalizedWord.length; i++) {
            const currentChar = normalizedWord.charAt(i);
            if (node.containsKey(currentChar)) {
                node = node.getNode(currentChar);
            } else {
                logDebug(fName, `could not find ${word} in tree`);
                return [];
            }
        }

        return [...new Set(node.getAllEnds().flatMap((node) => node.ids))];
    }
}