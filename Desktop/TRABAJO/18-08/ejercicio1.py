import nltk 
nltk.download('punkt')

from nltk.tokenize import word_tokenize

texto = "hola, software"
tokems = word_tokenize(texto)
print(tokems)