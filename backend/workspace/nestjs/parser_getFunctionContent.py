import ast


class FunctionSplitter(ast.NodeTransformer):
    def __init__(self):
        self.split_functions = []

    def visit_FunctionDef(self, node):
        function_parts = []
        for i, stmt in enumerate(node.body):
            new_function = ast.FunctionDef(
                name=f"{node.name}_part_{i+1}",
                args=node.args,
                body=[stmt],
                decorator_list=node.decorator_list,
                lineno=stmt.lineno,  # Set the lineno attribute
            )
            function_parts.append(new_function)
        self.split_functions.extend(function_parts)
        return None


def split_function(file_path):
    with open(file_path, "r") as file:
        code = file.read()
    tree = ast.parse(code)
    splitter = FunctionSplitter()
    splitter.visit(tree)
    split_code = [ast.unparse(func) for func in splitter.split_functions]
    return split_code


if __name__ == "__main__":
    import sys
    import json

    file_path = sys.argv[1]
    split_code = split_function(file_path)
    functions = []
    i = 0
    for part in split_code:
        attribute_name = "funct_" + str(i)
        functions.append({attribute_name: part})
        i += 1
    print(json.dumps(functions))
