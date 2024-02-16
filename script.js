const words = [
    { number: 1, direction: 'across', row: 3, column: 1, clue: 'Capital of India', answer: 'delhi' },
    { number: 2, direction: 'down', row: 1, column: 3, clue: 'Capital of Pakistan', answer: 'Islamabad' },
    { number: 3, direction: 'across', row: 7, column: 3, clue: 'Capital of China', answer: 'beijing' },
    { number: 4, direction: 'across', row: 6, column: 1, clue: 'Capital of Bangladesh', answer: 'dhaka' },
    { number: 5, direction: 'across', row: 4, column: 2, clue: 'Capital of Nepal', answer: 'kathmandu' },
    { number: 6, direction: 'down', row: 1, column: 10, clue: 'Capital of Afghanistan', answer: 'kabul' },
];

// Set global variables
const gridSize = [10, 9];
let direction = 'across';
let markCorrect = true;
let successShown = false;
let $clueTooltip = $('<div class="clue-tooltip invisible"><div class="clue-tooltip-arrow"></div><div class="clue-tooltip-text"></div></div>').appendTo('.crossword');

// set up the base grid
let $crosswordPuzzle = $('<div class="crossword-puzzle col-md-8 col-lg-9"></div>');
let $table = $('<table class="crossword-grid"></table>');
for (i = 0; i < gridSize[1]; i++)
{
    let $row = $('<tr class="grid-row"></tr>');
    for (j = 0; j < gridSize[0]; j++)
    {
        $square = $('<td class="grid-square"></td>');
        $square.appendTo($row);
    }
    $row.appendTo($table);
    $table.appendTo($crosswordPuzzle);
    $crosswordPuzzle.appendTo('.crossword');
}

// Add the fields to the grid
for (i = 0; i < words.length; i++)
{
    let row = words[i].row;
    let column = words[i].column;
    for (j = 0; j < words[i].answer.length; j++)
    {
        let $square = $('.grid-row').eq(row - 1).find('.grid-square').eq(column - 1);
        let title = words[i].clue + ', letter ' + (j + 1) + ' of ' + words[i].answer.length;
        let id = (words[i].direction == 'across' ? 'a' : 'd') + '-' + words[i].number + '-' + (j + 1);
        if (j == 0 && $square.find('.word-label').length == 0)
        {
            $('<span class="word-label">' + words[i].number + '</span>').appendTo($square);
        }
        if ($square.find('input').length == 0)
        {
            let $input = $('<input type="text" class="letter" title="' + title + '" id="' + id + '" maxlength="1" />');
            if (words[i].direction == 'across')
            {
                $input.attr('data-across', words[i].number);
                $input.attr('data-across-clue', words[i].clue);
            } else
            {
                $input.attr('data-down', words[i].number);
                $input.attr('data-down-clue', words[i].clue);
            }
            $input.data('letter', words[i].answer[j]);
            $input.appendTo($square);
            $square.addClass('active');
        } else
        {
            let $input = $square.find('input');
            $input.attr('title', $input.attr('title') + '; ' + title);
            $input.attr('id', $input.attr('id') + '+' + id);
            if (words[i].direction == 'across')
            {
                $input.attr('data-across', words[i].number);
                $input.attr('data-across-clue', words[i].clue);
            } else
            {
                $input.attr('data-down', words[i].number);
                $input.attr('data-down-clue', words[i].clue);
            }
        }
        if (words[i].direction == 'down')
        {
            row++;
        } else
        {
            column++;
        }
    }
}

// Add the clues to the page
let $crosswordClues = $('<div class="crossword-clues col-md-4 col-lg-3"><div class="row"></div></div>');
let $acrossClues = $('<div class="across-clues col-sm-6 col-md-12"><p><strong>Across</strong></p><ol></ol></div>');
let $downClues = $('<div class="down-clues col-sm-6 col-md-12"><p><strong>Down</strong></p><ol></ol></div>');
for (i = 0; i < words.length; i++)
{
    let $clue = $('<li value="' + words[i].number + '" data-direction="' + words[i].direction + '" data-clue="' + words[i].number + '"><label>' + words[i].clue + ' </label></li>');
    $clue.find('label').attr('for', $('[data-' + words[i].direction + '=' + words[i].number + ']').eq(0).attr('id'));
    $clue.on('click', function ()
    {
        direction = $(this).data('direction');
    })
    if (words[i].direction == 'across')
    {
        $clue.appendTo($acrossClues.find('ol'));
    } else
    {
        $clue.appendTo($downClues.find('ol'));
    }
}
$acrossClues.appendTo($crosswordClues.find('.row'));
$downClues.appendTo($crosswordClues.find('.row'));
$crosswordClues.appendTo('.crossword');

// Add the hints, reset, and show answers buttons
let $puzzleButtons = $('<div class="crossword-buttons"></div>');
let $resetButton = $('<button class="btn btn-default">Clear Puzzle</button>');
$resetButton.on('click', function (e)
{
    e.preventDefault();
    $('input.letter').val('').parent('.grid-square').removeClass('correct-down correct-across');
    $('.crossword-clues li').removeClass('correct');
    markCorrect = true;
});
$resetButton.appendTo($puzzleButtons);
let $solveButton = $('<button class="show-answers btn btn-default">Show Answers</button>');
$solveButton.on('click', function (e)
{
    e.preventDefault();
    $('input.letter').each(function ()
    {
        $(this).val($(this).data('letter'));
    });
    markCorrect = false;
});
$solveButton.appendTo($puzzleButtons);
$puzzleButtons.appendTo('.crossword');

// Add the success modal
let $modal = $('<div class="modal fade" id="success-modal" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">Congratulations!</h4></div><div class="modal-body"><p>You have finished the puzzle.</p></div></div></div></div>');
$modal.appendTo('body');

// When a square is focused, highlight the other squares in that word and the clue, and show the tooltip
$('input.letter').on('focus', function ()
{
    let $current = $(this);
    $current.select();
    $current[0].setSelectionRange(0, 10);
    getDirection($current);
    $('[data-' + direction + '=' + $current.data(direction) + ']').parent('.grid-square').addClass('current-word');
    $('.crossword-clues li').removeClass('active');
    $('.crossword-clues li[data-direction=' + direction + '][data-clue=' + $(this).data(direction) + ']').addClass('active');
    $clueTooltip.css({ 'left': tooltipPosition($current).left + 'px', 'top': tooltipPosition($current).top - 10 + 'px' }).removeClass('invisible').find('.clue-tooltip-arrow').css('left', tooltipPosition($current).offset + 'px');
})

// When a square is blurred, remove highlight from squares and clue
$('input.letter').on('blur', function ()
{
    $('.grid-square').removeClass('current-word');
    $('.crossword-clues li').removeClass('active');
    $clueTooltip.addClass('invisible');
})

// handle directional and letter keys in letter inputs
$('input.letter').on('keyup', function (e)
{
    let $current = $(this);
    if (e.which == 38)
    {      // up arrow moves to square above if it exists
        direction = 'down';
        if (getPrevLetter($current))
        {
            getPrevLetter($current).focus();
        }
    } else if (e.which == 40)
    {      // down arrow moves to square below if it exists
        direction = 'down';
        if (getNextLetter($current))
        {
            getNextLetter($current).focus();
        }
    } else if (e.which == 37)
    {      // left arrow moves to square to the left if it exists
        direction = 'across';
        if (getPrevLetter($current))
        {
            getPrevLetter($current).focus();
        }
    } else if (e.which == 39)
    {      // right arrow moves to square to the right if it exists
        direction = 'across';
        if (getNextLetter($current))
        {
            getNextLetter($current).focus();
        }
    } else
    {
        e.preventDefault();
    }
    if (markCorrect)
    {
        checkWord($current);
    };
})

// Tab and Shift/Tab move to next and previous words
$('input.letter').on('keydown', function (e)
{
    let $current = $(this);
    if (e.which == 9)
    {       // tab
        e.preventDefault();
        if (e.shiftKey)
        {       // shift/tab
            getPrevWord($current).focus();
        } else
        {
            getNextWord($current).focus();
        }
    } else if (e.which == 8)
    {        // backspace
        e.preventDefault();
        if ($(this).val().length > 0)
        {
            $(this).val('');
        } else
        {
            if (getPrevLetter($current))
            {
                getPrevLetter($current).focus().val('');
            }
        }
    } else if ((e.which >= 48 && e.which <= 90) || (e.which >= 96 && e.which <= 111) || (e.which >= 186 && e.which <= 192) || (e.which >= 219 && e.which <= 222))
    {    // typeable characters move to the next square in the word if it exists
        e.preventDefault();
        $current.val(String.fromCharCode(e.which));
        if (getNextLetter($current))
        {
            getNextLetter($current).focus();
        }
    }
    if (markCorrect)
    {
        checkWord($current);
    };
})

// Check if all letters in selected word are correct
function checkWord($current)
{
    let correct;
    let currentWord;
    if ($current.is('[data-across]'))
    {
        correct = 0;
        currentWord = $current.data('across');
        $('[data-across=' + currentWord + ']').each(function ()
        {
            if ($(this).val().toLowerCase() == $(this).data('letter').toLowerCase())
            {
                correct += 1;
            }
        })
        if (correct == $('[data-across=' + currentWord + ']').length)
        {
            $('[data-across=' + currentWord + ']').parent('.grid-square').addClass('correct-across');
            $('.crossword-clues li[data-direction=across][data-clue=' + currentWord + ']').addClass('correct');
        } else
        {
            $('[data-across=' + currentWord + ']').parent('.grid-square').removeClass('correct-across');
            $('.crossword-clues li[data-direction=across][data-clue=' + currentWord + ']').removeClass('correct');
        }
    }
    if ($current.is('[data-down]'))
    {
        correct = 0;
        currentWord = $current.data('down');
        $('[data-down=' + currentWord + ']').each(function ()
        {
            if ($(this).val().toLowerCase() == $(this).data('letter').toLowerCase())
            {
                correct += 1;
            }
        })
        if (correct == $('[data-down=' + currentWord + ']').length)
        {
            $('[data-down=' + currentWord + ']').parent('.grid-square').addClass('correct-down');
            $('.crossword-clues li[data-direction=down][data-clue=' + currentWord + ']').addClass('correct');
        } else
        {
            $('[data-down=' + currentWord + ']').parent('.grid-square').removeClass('correct-down');
            $('.crossword-clues li[data-direction=down][data-clue=' + currentWord + ']').removeClass('correct');
        }
    }
    if ($('.grid-square.active:not([class*=correct])').length == 0 && !successShown)
    {
        $('#success-modal').modal();
        successShown = true;
    }
}

// Return the input of the first letter of the next word in the clues list
function getNextWord($current)
{
    let length = $('.crossword-clues li').length;
    let index = $('.crossword-clues li').index($('.crossword-clues li.active'));
    let nextWord;
    if (index < length - 1)
    {
        $nextWord = $('.crossword-clues li').eq(index + 1);
    } else
    {
        $nextWord = $('.crossword-clues li').eq(0);
    }
    direction = $nextWord.data('direction');
    return $('[data-' + $nextWord.data('direction') + '=' + $nextWord.data('clue') + ']').eq(0);
}

// Return the input of the first letter of the previous word in the clues list
function getPrevWord($current)
{
    let length = $('.crossword-clues li').length;
    let index = $('.crossword-clues li').index($('.crossword-clues li.active'));
    // let prevWord;
    if (index > 0)
    {
        $prevWord = $('.crossword-clues li').eq(index - 1);
    } else
    {
        $prevWord = $('.crossword-clues li').eq(length - 1);
    }
    direction = $prevWord.data('direction');
    return $('[data-' + $prevWord.data('direction') + '=' + $prevWord.data('clue') + ']').eq(0);
}

// If there is a letter square before or after the current letter in the current direction, keep global direction the same, otherwise switch global direction
function getDirection($current)
{
    if (getPrevLetter($current) || getNextLetter($current))
    {
        direction = direction;
    } else
    {
        direction = (direction == 'across') ? 'down' : 'across';
    }
}

// Return the input of the previous letter in the current word if it exists, otherwise return false
function getPrevLetter($current)
{
    let index = $('[data-' + direction + '=' + $current.data(direction) + ']').index($current);
    if (index > 0)
    {
        return $('[data-' + direction + '=' + $current.data(direction) + ']').eq(index - 1);
    } else
    {
        return false;
    }
}

// Return the input of the next letter in the current word if it exists, otherwise return false
function getNextLetter($current)
{
    let length = $('[data-' + direction + '=' + $current.data(direction) + ']').length;
    let index = $('[data-' + direction + '=' + $current.data(direction) + ']').index($current);
    if (index < length - 1)
    {
        return $('[data-' + direction + '=' + $current.data(direction) + ']').eq(index + 1);
    } else
    {
        return false;
    }
}

// Return the top, left, and offset positions for tooltip placement
function tooltipPosition($current)
{
    let left = $('[data-' + direction + '=' + $current.data(direction) + ']').eq(0).offset().left - $('.crossword').offset().left;
    let top = $('[data-' + direction + '=' + $current.data(direction) + ']').eq(0).offset().top - $('.crossword').offset().top;
    $clueTooltip.find('.clue-tooltip-text').text($current.data(direction + '-clue'));
    let right = left + $clueTooltip.outerWidth();
    let offset = right - $('.crossword-puzzle').outerWidth();
    offset = offset > 0 ? offset : 0;
    left = left - offset;
    return { 'left': left, 'top': top, 'offset': offset };
}

