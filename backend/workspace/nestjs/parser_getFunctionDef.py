import ast


class FunctionInfoExtractor(ast.NodeVisitor):
    def __init__(self):
        self.functions = []

    def visit_FunctionDef(self, node):
        func_name = node.name
        parameters = [arg.arg for arg in node.args.args]
        return_type = None
        if node.returns:
            return_type = ast.dump(node.returns)
        self.functions.append(
            {"name": func_name, "parameters": parameters, "returnType": return_type}
        )
        self.generic_visit(node)


def extract_function_info(file_path):
    with open(file_path, "r") as source:
        tree = ast.parse(source.read())
    extractor = FunctionInfoExtractor()
    extractor.visit(tree)
    return extractor.functions


if __name__ == "__main__":
    import sys
    import json

    file_path = sys.argv[1]
    functions = extract_function_info(file_path)
    print(json.dumps(functions))
