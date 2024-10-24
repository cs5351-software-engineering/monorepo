import ast


def split_functions(file_path):
    with open(file_path, "r") as file:
        file_content = file.read()

    tree = ast.parse(file_content)
    functions = [node for node in tree.body if isinstance(node, ast.FunctionDef)]

    function_contents = {}
    for func in functions:
        start_line = func.lineno
        end_line = max(
            [node.lineno for node in ast.walk(func) if hasattr(node, "lineno")]
        )
        function_code = "\n".join(file_content.splitlines()[start_line - 1 : end_line])
        function_contents[func.name] = function_code

    return function_contents


if __name__ == "__main__":
    import sys
    import json

    file_path = sys.argv[1]
    functions = split_functions(file_path)
    result = []
    i = 0
    for name, content in functions.items():
        # print(f"Function {name}:\n{content}\n")
        attribute_name = "funct_" + str(i)
        result.append({attribute_name: content})
        i += 1
    # print(result)
    print(json.dumps(result))
