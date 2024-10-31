import ast


class FunctionInfoExtractor(ast.NodeVisitor):
    def __init__(self, source_code):
        self.functions = []
        self.source_code = source_code

    def visit_FunctionDef(self, node):
        func_name = node.name
        parameters = [arg.arg for arg in node.args.args]
        body = ast.get_source_segment(self.source_code, node)
        return_type = None
        if node.returns:
            return_type = ast.dump(node.returns)
        self.functions.append(
            {"name": func_name, "parameters": parameters, "returnType": return_type, "body": body}
        )
        self.generic_visit(node)


def extract_function_info(file_path):
    with open(file_path, "r") as source:
        source_code = source.read()
        tree = ast.parse(source_code)
    extractor = FunctionInfoExtractor(source_code)
    extractor.visit(tree)
    return extractor.functions


if __name__ == "__main__":
    import sys
    import json

    file_path = sys.argv[1]
    functions = extract_function_info(file_path)
    print(json.dumps(functions))
