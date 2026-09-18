import pandas as pd

file_path = '추가자료.xlsx'
try:
    df = pd.read_excel(file_path)
    df.to_csv('users_list.csv', index=False, encoding='utf-8-sig')
    print("Successfully saved to users_list.csv")
except Exception as e:
    print(f"Error: {e}")
