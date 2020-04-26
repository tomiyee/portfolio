import sys
import io, getopt, ast

# Code to run
code = ",."
valid_chars = set(list("+-.,[]<>*"))

def interpret (code):
    code_length = len(code)
    code_position = 0

    # This keeps track of where the loops should return to
    open_bracket_positions = []
    # memory related
    memory = [0]
    memory_pointer = 0

    output = ''

    while code_position < code_length:
        char = code[code_position]
        # invalid character
        if char not in valid_chars:
            code_position += 1
            continue
        # Add to memory
        if char == '+':
            # if the memory is in range, do
            if memory_pointer >= 0:
                memory[memory_pointer] += 1
                if memory[memory_pointer] == 256:
                    memory[memory_pointer] = 0
            code_position += 1
            continue
        # Subtract from memory
        if char == '-':
            # if the memory is in range, do
            if memory_pointer >= 0:
                memory[memory_pointer] -= 1
                if memory[memory_pointer] == -1:
                    memory[memory_pointer] = 255
            code_position += 1
            continue
        # Print from memory
        if char == '.':
            output += chr(memory[memory_pointer])
            code_position += 1
            continue
        # Moves left in memory
        if char == '<':
            memory_pointer -= 1
            code_position += 1
            continue
        # moves right in memory
        if char == '>':
            memory_pointer += 1
            if memory_pointer == len( memory ):
                memory.append(0)
            code_position += 1
            continue

        if char == '[':
            open_bracket_positions.append(code_position)
            if memory[memory_pointer] == 0:
                opens_passed = 0
                c = ''
                while c != ']' and opens_passed == 0:
                    code_position += 1
                    c = code[code_position]
                    if c == '[':
                        opens_passed += 1
                    if c == ']':
                        opens_passed -= 1
                continue
            code_position += 1
            continue
        if char == ']':
            last_brack = open_bracket_positions.pop()
            if memory[memory_pointer] == 0:
                code_position += 1
                continue
            code_position = last_brack
            continue
        if char == ',':
            val = str(input('  Input: '))
            if len(val) == 0:
                val = 0
            else:
                val = int(val)
            if memory_pointer >= 0:
                memory[memory_pointer] = val
            code_position += 1
            continue
        if char == '*':
            print(memory)
            code_position += 1
            continue
    print(output)


# running interpretter.py

if __name__ == '__main__':

    argv = sys.argv[1:]
    file = None
    try:
        opts, args = getopt.getopt(argv,"f:",["file="])
    except getopt.GetoptError:
        print ('interpretter.py -f <source>')
        sys.exit(2)
    for opt, arg in opts:
        if opt in ('-f', '--file'):
            file = arg
    # Reads the contents of the file provided
    if file:
        code = open(file,'r').read()
    # Interprets the code
    interpret(code)
