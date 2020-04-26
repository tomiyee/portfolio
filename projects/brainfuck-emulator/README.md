# Brainfuck Emulator

## What is Brainfuck?

According to the Brainfuck Wikipedia page:

Brainfuck is an esoteric programming language created in 1993 by
Urban Müller, and is notable for its extreme minimalism.

The language consists of only eight simple commands and an
instruction pointer. While it is fully Turing complete, it is not
intended for practical use, but to challenge and amuse programmers.
Brainfuck simply requires one to break commands into microscopic steps.

## Commands

<table class='command-table'>
  <tr>
    <td>&gt;</td>
    <td>increment the data pointer (to point to the next cell to the right).</td>
  </tr>
  <tr>
    <td>&lt;</td>
    <td>decrement the data pointer (to point to the next cell to the left).</td>
  </tr>
  <tr>
    <td>+</td>
    <td>increment (increase by one) the byte at the data pointer.</td>
  </tr>
  <tr>
    <td>-</td>
    <td>decrement (decrease by one) the byte at the data pointer.</td>
  </tr>
  <tr>
    <td>.</td>
    <td>output the byte at the data pointer.</td>
  </tr>
  <tr>
    <td>,</td>
    <td>output the byte at the data pointer.</td>
  </tr>
  <tr>
    <td>[</td>
    <td>
      if the byte at the data pointer is zero, then instead of
      moving the instruction pointer forward to the next command,
      jump it forward to the command after the matching ] command.
    </td>
  </tr>
  <tr>
    <td>]</td>
    <td>
      if the byte at the data pointer is nonzero, then instead
      of moving the instruction pointer forward to the next command,
      jump it back to the command after the matching [ command.
    </td>
  </tr>
  <tr>
    <td>*</td>
    <td>
      (my custom addition) prints the contents of memory to the browser
      console (not on-screen console), which you can open with Ctrl +
      Shift + J on Windows.
    </td>
  </tr>
</table>

## Context

During Spring 2019, my friends and I challenged each other to make a "brainfuck
interpretter" for the esoteric Brainfuck programming language because its
minimal syntax seemed to lend itself well to a quick software development
exercise.

Originally, I had written this project in Python because I wanted to strengthen
familiarity for my programming class that semester, 6.009. I later converted the
logic into Javascript, my first language.
