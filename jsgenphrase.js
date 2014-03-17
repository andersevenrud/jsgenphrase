"use strict";
/**
 * jsgenphrase - Copyright (c) 2014, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @package jsgenphrase
 * @link https://github.com/andersevenrud/jsgenphrase
 */
(function() {
  var MIN_WORD_COUNT    = 20;       // Minimum number of words
  var MIN_ENTROPY_BITS  = 26.0;     // Minimum entropy bits
  var MAX_ENTROPY_BITS  = 120.0;    // Maximum entropy bits

  /**
   * Default GenPhrase() options
   */
  var DefaultOptions = {
    bits:               50.0,               // Entropy bits
    separators:         '-_!$&*+=23456789', // List of separators
    wordLists:          ['default'],        // Default array of word-list array
    enableModifiers:    true,               // Enable string modifications
    enableSeparators:   true,               // Enable string separators
    funcGetElement:     null,               // Override default random number generator
    funcModifyString:   null                // Override default string modifier
  };

  /**
   * Get all words from list
   */
  function GetWordsAsArray(list) {
    var data = window.GenPhraseWordLists;
    if ( !(list instanceof Array) ) {
      throw "GetWordsAsArray() error: No list supplied";
    }
    if ( !(data instanceof Object) ) {
      throw "GetWordsAsArray() error: Word Lists are missing";
    }

    var result = [];
    for ( var i = 0; i < list.length; i++ ) {
      if ( typeof data[list[i]] === 'undefined' ) {
        throw "GetWordsAsArray() error: Invalid word list " + list[i];
      }
      result = result.concat(data[list[i]]);
    }
    return result;
  }

  /**
   * Get random index
   */
  function GetElement(max, min) {
    min = min || 0;

    return Math.floor(Math.random()*(max-min+1)+min);
  }

  /**
   * Get entropy bits from number
   */
  function GetBits(idx) {
    var num = Math.log(idx, 2);
    return parseFloat(num.toPrecision(2));
  }

  /**
   * Modify a word
   * This default function randomizes when to apply uppercase to
   * the first letter of word
   */
  function Modify(str) {
    if ( GetElement(2) === 0 ) {
      return (str.charAt(0).toUpperCase() + str.slice(1));
    }
    return str;
  }

  /**
   * Generate a passphrase
   * See 'DefaultOptions' for options you can supply
   */
  function GenPhrase(opts) {
    opts = opts || {};

    for ( var i in DefaultOptions ) {
      if ( DefaultOptions.hasOwnProperty(i) ) {
        if ( (typeof opts[i] === 'undefined') ) {
          opts[i] = DefaultOptions[i];
        }
      }
    }

    var funcGetElement   = opts.funcGetElement   || GetElement;
    var funcModifyString = opts.funcModifyString || Modify;

    var bits = parseFloat(opts.bits);
    if ( opts.bits < MIN_ENTROPY_BITS || opts.bits > MAX_ENTROPY_BITS ) {
      throw "GenPhrase() error: bits must be between " + MIN_ENTROPY_BITS + " and " + MAX_ENTROPY_BITS;
    }

    var words = GetWordsAsArray(opts.wordLists);
    if ( words.length < MIN_WORD_COUNT ) {
      throw "GenPhrase() error: word list must be at least " + MIN_WORD_COUNT + " words";
    }

    var separators    = opts.separators || '';
    var maxSeparators = separators.length;
    var separatorBits = GetBits(maxSeparators);
    var maxIndex      = words.length;
    var countForBits  = maxIndex * (opts.enableModifiers ? 2 : 1);
    var wordBits      = GetBits(countForBits);

    if ( wordBits < 1 ) {
       throw "GenPhrase() error: Words does not have enough bits to create a passphrase";
    }


    /*
    console.group("GenPhrase()");
    console.log('options', opts);
    console.debug('words', maxIndex, wordBits);
    console.debug('separators', maxSeparators, separatorBits);
    console.groupEnd();
    */

    var phrase = '';
    var index, word;
    while ( bits > 0.0 ) {
      index = funcGetElement(maxIndex);
      word  = words[index];

      if ( opts.enableModifiers ) {
        word = funcModifyString(word);
      }

      phrase += word;
      bits   -= wordBits;

      if ( bits > separatorBits && opts.enableSeparators && maxSeparators ) {
        phrase += separators.charAt(funcGetElement(maxSeparators));
        bits   -= separatorBits;
      } else if ( bits > 0.0 && !opts.enableSeparators ) {
        phrase += '';
      }
    }

    return phrase;
  }

  //
  // Exports
  //
  window.GenPhrase = GenPhrase;

})();
