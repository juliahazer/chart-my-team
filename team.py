import requests
import bs4
import csv
import re

url = 'https://www.ustanorcal.com/teaminfo.asp?id='
id = 63383
# id = 74997

#create a list with a sub list with data for each player
list_players = []
header_lst = []

# while (id < 74998):
while (id < 63384):
  curr_url = url + str(id)
  data = requests.get(curr_url)
  soup = bs4.BeautifulSoup(data.text, "html.parser")

  #selects all tables from the page
  tables = soup.select("table")

  #get team name
  header_team = tables[1].find_all('td')[-1]
  team_name = ''.join(header_team.find('br').next_siblings)

  print(team_name)

  if team_name == '':
    id += 1
    continue

  roster_table = []

  #selects the team roster table because it has cells containing 'expiration' & 'rating'
  for table in tables:
    if table.find('td', string='Expiration') and table.find('td', string='Rating'):
      roster_table = table

  #stores the rows from the roster table and removes the 1st row (that only has 'eligibility')
  rows = roster_table.select('tr')
  rows.pop(0)

  headers = rows.pop(0)
  header_tds = headers.select('td')
  header_lst = [header_td.text.rstrip() for header_td in header_tds]
  header_lst.insert(0, 'Team Name')
  header_lst.append('Win')
  header_lst.append('Loss')

  for row in rows:
    tds = row.select('td')
    sublist_player = [td.text.rstrip() for td in tds]
    sublist_player.insert(0,team_name)
    list_players.append(sublist_player)

  id += 1

#print(list_players)

for player in list_players:
  str_win_loss = player[7]
  arr = str_win_loss.split(' / ')
  player.append(arr[0]) #append Win
  player.append(arr[1]) #append Loss

# save the data as a tab-separated file
with open('player_data.tsv', 'w') as tsvfile:
  writer = csv.writer(tsvfile, delimiter="\t")
  writer.writerow(header_lst)
  writer.writerows(list_players)
