from setuptools import setup

setup(
    name="mannr",
    version="0.1",
    py_modules=["mannr"],   # 👈 key difference: py_modules, not packages
    install_requires=[],
    author="Aaditya Chunekar",
    description="A simple single-file offline Python package",
)
