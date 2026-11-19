library(ncdf4)
library(ncdump)
library(ggplot2) # tidyverse data visualization package
library(tidyverse)
library(sf)
library(rnaturalearth)
library(rnaturalearthdata)
library(rworldmap)
library(raster)
library(stars)
library(ggpubr)
library(colorRamps)
library(rcolors)
library(cmsaf)
library(patchwork)

# functions

lonc <- function(orig_lon){
  return ( (( orig_lon + 180 ) %% 360 ) -180 )
}

convert_kelvin_to_celsius <-function(temp){
  return(temp - 273.15)
}

#---------------------------------------------
conversion for gps: 
  - longitude: divide by 2, add to 0 if east, subtract from 180 if west
  - latitude: divide distance from center by 2 and add/subtract to 45


conversion for airs:
  - longitude: 180 +/- (regular bounds east/west)
  - latitude: treat 90 as center, then add/subtract N and S values

plot(abl_thickness[,100:125,45:75,3])
plot(jja_mean[,30:90,])

#---------------------------------------------
# looking at planetary boundary layer height thickness

data <- "/Users/anniefeng/data/pblh_gps_2006-2019_2x2_season.nc"

# nc <- nc_open(data)
# lat.c <- ncvar_get(nc,"lat")
# lon.c <- ncvar_get(nc,"lon")
# season.c <- ncvar_get(nc, "season")
# atm.c <- ncvar_get(nc, "atmosphere_boundary_layer_thickness")
# 
# nc_close(nc)
# 
# lon.c <- lonc(lon.c)

seasons <- c("DJF", "MAM", "JJA", "SON")

abl <- read_ncdf(data, var = "atmosphere_boundary_layer_thickness")
sea_flag <- read_ncdf(data, var = "surface_type")
abl_mask <- abl[sea_flag["surface_type"] == 0]

abl_thickness <- st_set_dimensions(abl_mask, "season", values = seasons)
abl_thickness[abl_thickness > 3000] <- 3000
abl_thickness[abl_thickness < 0] <- 0
plot(abl_thickness, col = color)


plot(abl_thickness[,20:70,15:60,1], col = color)

gps_annual_mean <- st_apply(abl_thickness, c(1,2), mean, na.rm=TRUE)
plot(gps_annual_mean, col = color)

# for (i in seq_along(seasons)) {
#   atm_season <- atm.c[,,i]
#   plot(atm_season)
#   world <- ne_coastline(scale = "medium")
#   plot(world$geometry)
# }

# Turn off S2
sf_use_s2(FALSE)


#---------------------------------------------
# looking at boundary layer height from AIRS
airs_data <- "/Users/anniefeng/data/airs_boundary_layer_2018-2023/data_with_mean.nc"
test <- "/Users/anniefeng/data/airs_boundary_layer_2018-2023/AIRS.2022.01.15.L3.RetSup_IR001.v7.0.7.0.G22137071628.hdf.nc4"
seasons <- c("DJF", "MAM", "JJA", "SON")

data_test <- read_ncdf(airs_data, var = "bndry_lyr_top_mean")
data_test

testing <- read_ncdf(test)

test3 <- read_ncdf(test, var = "bndry_lyr_top_A")

# this works for combining graphs
combined <- c(test3, testing, along = "new_dim")
plot(combined, mfrow = c(1,2))


variables <- c("bndry_lyr_top_A", "bndry_lyr_top_A_ct", "bndry_lyr_top_D", "bndry_lyr_top_D_ct", "LandSeaMask")
season_numeric <- list(c(1,2,12), c(3,4,5), c(6,7,8), c(9,10,11))
c(3,4,5)

for (i in 1:4) {
  print(i)
  file_name <- paste("/Users/anniefeng/data/airs_boundary_layer_2018-2023/",seasons[i],".nc", sep ="")
  
  selmon(var = c("bndry_lyr_top_A"), month = season_numeric[[i]], "/Users/anniefeng/data/airs_boundary_layer_2018-2023/data2.nc",
         file_name, overwrite = TRUE)
}

selmon(var = "bndry_lyr_top_A", month = season_numeric[[i]], "/Users/anniefeng/data/airs_boundary_layer_2018-2023/data2.nc",
       file_name, overwrite = TRUE)

#---------------------------------------------

color <- get_color("cmocean_haline", n = 256)

seasonal_mean <- function(section) {
  
  file_names <- NULL
  
  for (i in seq_len(3)){
    data <- paste("/Users/anniefeng/data/processed_data/AIRS.",section[i],".MonthlyMean.PBLH.nc4", sep = "")
    file_names <- c(file_names, data)
  }
  
  combined_data <- c(read_ncdf(file_names[1], var = "bndry_lyr_top_ADAverageMeter"),
                     read_ncdf(file_names[2], var = "bndry_lyr_top_ADAverageMeter"),
                     read_ncdf(file_names[3], var = "bndry_lyr_top_ADAverageMeter"), along = "new_dim")
  
  curr_mean <- st_apply(combined_data, c(1,2), mean, na.rm=TRUE)
  curr_mean[curr_mean < 0] <- 0
  
  return(curr_mean)
}

# dec_data <- read_ncdf(data, var = "bndry_lyr_top_ADAverageMeter")
# jan_data <- read_ncdf(data, var = "bndry_lyr_top_ADAverageMeter")
# feb_data <- read_ncdf(data, var = "bndry_lyr_top_ADAverageMeter")
# test <- c(dec_data, jan_data, feb_data, along = "test")
# plot(dec_data, col = color)
# plot(jan_data, col = color)
# plot(feb_data, col = color)
# 
# test_mean <- st_apply(test, c(1,2), mean, na.rm=TRUE)
# test_mean
# plot(test_mean, col = color)

djf <- c("12","01","02")
mam <- c("03", "04", "05")
jja <- c("06", "07", "08")
son <- c("09", "10", "11")

# testing the seasonal_mean function
#----------------------------------------
dec_file <- "/Users/anniefeng/data/processed_data/AIRS.12.MonthlyMean.PBLH.nc4"
december <- read_ncdf(dec_file, var = "bndry_lyr_top_ADAverageMeter")

jan_file <- "/Users/anniefeng/data/processed_data/AIRS.01.MonthlyMean.PBLH.nc4"
january <- read_ncdf(jan_file, var = "bndry_lyr_top_ADAverageMeter")

feb_file <- "/Users/anniefeng/data/processed_data/AIRS.02.MonthlyMean.PBLH.nc4"
february <- read_ncdf(feb_file, var = "bndry_lyr_top_ADAverageMeter")

djf_test <- c(december, january, february, along = "new_dim")
djf_test_mean <- st_apply(djf_test, c(1,2), mean, na.rm = TRUE)
djf_test_mean[djf_test_mean < 0] <- 0
djf_test_mean
djf_mean

#----------------------------------------

djf_mean <- seasonal_mean(djf)
mam_mean <- seasonal_mean(mam)
jja_mean <- seasonal_mean(jja)
son_mean <- seasonal_mean(son)

plot(abl_thickness[,,,1])
plot(djf_mean)

# this is for DJF
gps_indian_ocean <- abl_thickness[,25:50,37.5:52.5,1]
airs_indian_ocean <- djf_mean[,230:280,75:105]
plot(djf_mean[,230:280,75:105])
# par(mfrow=c(1,2), mar = c(2,2,2,2))
# boxplot(gps_indian_ocean, ylim = c(0,3000), xlab = "GPS")
# boxplot(airs_indian_ocean, ylim = c(0,3000), xlab = "AIRS")

gps_1 <- as.vector(gps_indian_ocean[[1]])
airs_1 <- as.vector(airs_indian_ocean[[1]])
df <- data.frame(source = c(rep("GPS", 416), rep("AIRS", 1581)), 
                 pblh = c(gps_1, airs_1))

seasons <- c("DJF", "MAM", "JJA", "SON")


# just airs box plots
for (i in seq_len(4)){
  if (i==1){
    airs <- djf_mean
  } else if (i == 2){
    airs <- mam_mean
  } else if (i == 3) {
    airs <- jja_mean
  } else {
    airs <- son_mean
  }
  
  # 230:280, 75:105
  airs_temp <- as.vector(airs[,20:70,1:90][[1]])
  length_airs <- length(airs_temp)
  
  df <- data.frame(season = rep(seasons[i], length_airs),
                   pblh = c(airs_temp))
  if (i == 1) {
    airs_test <- df
  } else {
    airs_test <- rbind(airs_test, df)
  }
  
}
boxplot(pblh ~ season, data = airs_test, main = 'AIRS Only Pacific Ocean, Lat < 0')


plot(abl_thickness[,25:50,1:45,3])
plot(jja_mean[,20:70,1:90])


#---------------------------------------
gps_djf <- as.vector(abl_thickness[,15:60,1:45,1][[1]])
length_gps <- length(gps_djf)

airs_djf <- as.vector(djf_mean[,210:300,90:180][[1]])
length_airs <- length(airs_djf)

df <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                 pblh = c(gps_data, airs_temp), 
                 season = rep("DJF", length_gps + length_airs))

gps_jja <- as.vector(abl_thickness[,15:60,1:45,3][[1]])
length_gps <- length(gps_jja)

airs_jja <- as.vector(jja_mean[,230:280,90:180][[1]])
length_airs <- length(airs_jja)

df2 <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                 pblh = c(gps_jja, airs_jja), 
                 season = rep("JJA", length_gps + length_airs))

df <- rbind(df, df2)

boxplot(pblh ~ source + season, data = df, 
        at = c(1,2,4,5), main = 'test, Lat < 0')


plot(djf_mean[,210:300,90:180])
plot(abl_thickness[,15:60,1:45,1])
jja_mean[,230:280,90:180]
#----------------------------------------

# indian ocean (buoy) box plots
for (i in seq_len(4)){
  
  if (i==1){
    airs <- djf_mean
  } else if (i == 2){
    airs <- mam_mean
  } else if (i == 3) {
    airs <- jja_mean
  } else {
    airs <- son_mean
  }
  
  # 25:50, 37.5:52.5
  gps_data <- as.vector(abl_thickness[,25:50,37.5:52.5,i][[1]])
  length_gps <- length(gps_data)
  
  # 230:280, 75:105
  airs_temp <- as.vector(airs[,230:280,75:105][[1]])
  length_airs <- length(airs_temp)
  
  df <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                   pblh = c(gps_data, airs_temp), 
                   season = rep(seasons[i], length_gps + length_airs))
  if (i == 1) {
    region <- df
  } else {
    region <- rbind(region, df)
  }
  
}

indian_test <- region %>%
  group_by(season, source) %>%
  summarise(
    n=n(),
    mean = mean(pblh, na.rm = TRUE),
    sd = sd(pblh, na.rm = TRUE)
  ) %>%
  mutate( se = sd/sqrt(n)) %>%
  mutate( ic = se * qt((1-0.05)/2 + 0.5, n-1))

groups <- c("DJF.AIRS", "DJF.GPS", "JJA.AIRS", "JJA.GPS", "MAM.AIRS", "MAM.GPS", "SON.AIRS", "SON.GPS")
pacific_test

# Confidence Interval
ggplot(indian_test) +
  geom_bar( aes(x = groups, y=mean), stat="identity", fill="forestgreen", alpha=0.5) +
  geom_errorbar( aes(x=groups, ymin=mean-ic, ymax=mean+ic), width=0.4, colour="navyblue", alpha=0.9, linewidth=0.5) +
  ggtitle("Indian Ocean (total)")

boxplot(pblh ~ source + season, data = region, 
        at = c(1,2,4,5,7,8,10,11), main = 'AIRS vs. GPS Indian Ocean')

#------------------------------------------

# pacific ocean (buoy) box plots
for (i in seq_len(4)){
  if (i==1){
    airs <- djf_mean
  } else if (i == 2){
    airs <- mam_mean
  } else if (i == 3) {
    airs <- jja_mean
  } else {
    airs <- son_mean
  }
  
  gps_data <- as.vector(abl_thickness[,62.5:137.5,37.5:52.5,i][[1]])
  length_gps <- length(gps_data)
  
  airs_1 <- as.vector(airs[,1:95,75:105][[1]])
  airs_2 <- as.vector(airs[,305:360,75:105][[1]])
  airs_temp <- c(airs_1, airs_2)
  length_airs <- length(airs_temp)
  
  df <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                   pblh = c(gps_data, airs_temp), 
                   season = rep(seasons[i], length_gps + length_airs))
  if (i == 1) {
    region <- df
  } else {
    region <- rbind(region, df)
  }
  
}

pacific_buoy <- region %>%
  group_by(season, source) %>%
  summarise(
    n=n(),
    mean = mean(pblh, na.rm = TRUE),
    sd = sd(pblh, na.rm = TRUE)
  ) %>%
  mutate( se = sd/sqrt(n)) %>%
  mutate( ic = se * qt((1-0.05)/2 + 0.5, n-1))

# Confidence Interval
ggplot(pacific_buoy) +
  geom_bar( aes(x = groups, y=mean), stat="identity", fill="forestgreen", alpha=0.5) +
  geom_errorbar( aes(x=groups, ymin=mean-ic, ymax=mean+ic), width=0.4, colour="navyblue", alpha=0.9, linewidth=0.5) +
  ggtitle("Pacific Ocean (regular buoy)")

boxplot(pblh ~ source + season, data = region, 
        at = c(1,2,4,5,7,8,10,11), main = 'AIRS vs. GPS Pacific Ocean')

#------------------------------------------

# atlantic ocean (buoy) box plots
for (i in seq_len(4)){
  if (i==1){
    airs <- djf_mean
  } else if (i == 2){
    airs <- mam_mean
  } else if (i == 3) {
    airs <- jja_mean
  } else {
    airs <- son_mean
  }
  
  gps_1 <- as.vector(abl_thickness[,156:180,32.5:57.5,i][[1]])
  gps_2 <- as.vector(abl_thickness[,1:7.5,32.5:57.5,i][[1]])
  gps_data <- c(gps_1, gps_2)
  length_gps <- length(gps_data)
  
  airs_temp <- as.vector(airs[,132:195,65:115][[1]])
  length_airs <- length(airs_temp)
  
  df <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                   pblh = c(gps_data, airs_temp), 
                   season = rep(seasons[i], length_gps + length_airs))
  if (i == 1) {
    region <- df
  } else {
    region <- rbind(region, df)
  }
  
}

atlantic_test <- region %>%
  group_by(season, source) %>%
  summarise(
    n=n(),
    mean = mean(pblh, na.rm = TRUE),
    sd = sd(pblh, na.rm = TRUE)
  ) %>%
  mutate( se = sd/sqrt(n)) %>%
  mutate( ic = se * qt((1-0.05)/2 + 0.5, n-1))


groups <- c("DJF.AIRS", "DJF.GPS", "JJA.AIRS", "JJA.GPS", "MAM.AIRS", "MAM.GPS", "SON.AIRS", "SON.GPS")

# Confidence Interval
ggplot(atlantic_test) +
  geom_bar( aes(x = groups, y=mean), stat="identity", fill="forestgreen", alpha=0.5) +
  geom_errorbar( aes(x=groups, ymin=mean-ic, ymax=mean+ic), width=0.4, colour="navyblue", alpha=0.9, linewidth=0.5) +
  ggtitle("Atlantic Ocean (buoy)")

boxplot(pblh ~ source + season, data = region, 
        at = c(1,2,4,5,7,8,10,11), main = 'AIRS vs. GPS Atlantic Ocean')

#------------------------------------------

# pacific ocean (by CA) box plots
for (i in seq_len(4)){
  
  if (i==1){
    airs <- djf_mean
  } else if (i == 2){
    airs <- mam_mean
  } else if (i == 3) {
    airs <- jja_mean
  } else {
    airs <- son_mean
  }
  
  gps_data <- as.vector(abl_thickness[,100:125,45:75,i][[1]])
  length_gps <- length(gps_data)
  
  airs_temp <- as.vector(airs[,20:70,30:90][[1]])
  length_airs <- length(airs_temp)
  
  df <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                   pblh = c(gps_data, airs_temp), 
                   season = rep(seasons[i], length_gps + length_airs))
  if (i == 1) {
    region <- df
  } else {
    region <- rbind(region, df)
  }
  
}

boxplot(pblh ~ source + season, data = region, 
        at = c(1,2,4,5,7,8,10,11), main = 'AIRS vs. GPS Pacific Ocean (by CA)')

#------------------------------------------

# pacific ocean (subset)
for (i in seq_len(4)){
  if (i==1){
    airs <- djf_mean
  } else if (i == 2){
    airs <- mam_mean
  } else if (i == 3) {
    airs <- jja_mean
  } else {
    airs <- son_mean
  }
  
  gps_data <- as.vector(abl_thickness[,62.5:107.5,37.5:60,i][[1]])
  length_gps <- length(gps_data)
  
  airs_1 <- as.vector(airs[,1:35,75:120][[1]])
  airs_2 <- as.vector(airs[,305:360,75:120][[1]])
  airs_temp <- c(airs_1, airs_2)
  length_airs <- length(airs_temp)
  
  df <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                   pblh = c(gps_data, airs_temp), 
                   season = rep(seasons[i], length_gps + length_airs))
  if (i == 1) {
    region <- df
  } else {
    region <- rbind(region, df)
  }
  
}

pacific_test <- region %>%
  group_by(season, source) %>%
  summarise(
    n=n(),
    mean = mean(pblh, na.rm = TRUE),
    sd = sd(pblh, na.rm = TRUE)
  ) %>%
  mutate( se = sd/sqrt(n)) %>%
  mutate( ic = se * qt((1-0.05)/2 + 0.5, n-1))

groups <- c("DJF.AIRS", "DJF.GPS", "JJA.AIRS", "JJA.GPS", "MAM.AIRS", "MAM.GPS", "SON.AIRS", "SON.GPS")
pacific_test

# Confidence Interval
ggplot(pacific_test) +
  geom_bar( aes(x = groups, y=mean), stat="identity", fill="forestgreen", alpha=0.5) +
  geom_errorbar( aes(x=groups, ymin=mean-ic, ymax=mean+ic), width=0.4, colour="navyblue", alpha=0.9, linewidth=0.5) +
  ggtitle("Pacific Ocean (subregion)")

boxplot(pblh ~ source + season, data = region, 
        at = c(1,2,4,5,7,8,10,11), main = 'AIRS vs. GPS Atlantic Ocean')

#------------------------------------------

# atlantic ocean subet
for (i in seq_len(4)){
  if (i==1){
    airs <- djf_mean
  } else if (i == 2){
    airs <- mam_mean
  } else if (i == 3) {
    airs <- jja_mean
  } else {
    airs <- son_mean
  }
  
  gps_1 <- as.vector(abl_thickness[,156:180,42.5:57.5,i][[1]])
  gps_2 <- as.vector(abl_thickness[,1:7.5,42.5:57.5,i][[1]])
  gps_data <- c(gps_1, gps_2)
  length_gps <- length(gps_data)
  
  airs_temp <- as.vector(airs[,132:195,85:115][[1]])
  length_airs <- length(airs_temp)
  
  df <- data.frame(source = c(rep("GPS", length_gps), rep("AIRS", length_airs)), 
                   pblh = c(gps_data, airs_temp), 
                   season = rep(seasons[i], length_gps + length_airs))
  if (i == 1) {
    region <- df
  } else {
    region <- rbind(region, df)
  }
  
}

atlantic_test <- region %>%
  group_by(season, source) %>%
  summarise(
    n=n(),
    mean = mean(pblh, na.rm = TRUE),
    sd = sd(pblh, na.rm = TRUE)
  ) %>%
  mutate( se = sd/sqrt(n)) %>%
  mutate( ic = se * qt((1-0.05)/2 + 0.5, n-1))


groups <- c("DJF.AIRS", "DJF.GPS", "JJA.AIRS", "JJA.GPS", "MAM.AIRS", "MAM.GPS", "SON.AIRS", "SON.GPS")

# Confidence Interval
ggplot(atlantic_test) +
  geom_bar( aes(x = groups, y=mean), stat="identity", fill="forestgreen", alpha=0.5) +
  geom_errorbar( aes(x=groups, ymin=mean-ic, ymax=mean+ic), width=0.4, colour="navyblue", alpha=0.9, linewidth=0.5) +
  ggtitle("Atlantic Ocean (above equator)")

boxplot(pblh ~ source + season, data = region, 
        at = c(1,2,4,5,7,8,10,11), main = 'AIRS vs. GPS Atlantic Ocean')

#------------------------------------------

annual <- c(djf_mean, mam_mean, jja_mean, son_mean, along = "new_dim")
annual <- st_set_dimensions(annual, "new_dim", values = seasons)

plot(annual, mfrow = c(2,2), col = color)

airs_annual_mean <- st_apply(annual, c(1,2), mean, na.rm=TRUE)

plot(airs_annual_mean, col = color)

st_dimensions(djf_mean)

#----------------
