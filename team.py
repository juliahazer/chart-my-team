import requests
import bs4
import csv
import re

url = 'https://www.ustanorcal.com/teaminfo.asp?id='
id = 74111

#create a list with a sub list with data for each player
list_players = []

while (id < 74112):
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

  for row in rows:
    tds = row.select('td')
    sublist_player = [td.text.rstrip() for td in tds]
    sublist_player.insert(0,team_name)
    list_players.append(sublist_player)

  id += 1

#print(list_players)

# save the data as a tab-separated file
with open('player_data.tsv', 'w') as tsvfile:
  writer = csv.writer(tsvfile, delimiter="\t")
  writer.writerows(list_players)


####################

# schedule_table = []

# #selects the team schedule table because it has cells containing 'Match time' & 'Opposing Team'

# for table in tables:
#   if table.find('td', string = 'Match date') and table.find('td', string='Opposing Team'):
#     schedule_table = table

# #stores the rows from the schedule table
# sch_rows = schedule_table.select('tr')

# # \xa0 -- like a &nbsp;
# # want to remove everything after \r\n in Match time

# #create a list with a sub list with data for each match
# list_matches = []
# for row in sch_rows:
#   tds = row.select('td')
#   tds = tds[:8]
#   #skip over 2nd and 3rd row which are empty
#   if tds[0].text != '':
#     sublist_match = []
#     for td in tds:
#       td = td.text.rstrip()
#       td = td.replace(u'\xa0', u' ')
#       td = td.lstrip()
#       if "\r\n" in td:
#         index = td.index('\r\n')
#         td = td[:index]
#       sublist_match.append(td)
#     list_matches.append(sublist_match)

# # print(list_matches)

# # save the data as a tab-separated file
# with open('match_data.tsv', 'w') as tsvfile:
#   writer = csv.writer(tsvfile, delimiter="\t")
#   writer.writerows(list_matches)




