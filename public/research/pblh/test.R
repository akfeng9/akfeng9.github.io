#install.packages("ncdf4")
library(ncdf4)
library(ncdump)
lonc <- function(orig_lon){
  return ( (( orig_lon + 180 ) %% 360 ) -180 )
}

convert_kelvin_to_celsius <-function(temp){
  return(temp - 273.15)
}

cyg.ff <- "/Users/anniefeng/data/cyg.ddmi.s20180801-000000-e20180801-235959.l2.surface-flux.a32.d33.nc"
#cyg.ff <- "/Users/anniefeng/data/cyg.ddmi.s20180801-000000-e20180801-235959.l2.surface-flux.a32.d33.nc.md5"

nc <- nc_open(cyg.ff)
st.c <- ncvar_get(nc,"sample_time")
lat.c <- ncvar_get(nc,"lat")
lon.c <- ncvar_get(nc,"lon")
lhf.c <- ncvar_get(nc,"lhf")
shf.c <- ncvar_get(nc,"shf")
# usr.c <- ncvar_get(nc,"usr")
solar.c <- ncvar_get(nc,"solar_time")
# rho_a.c <- ncvar_get(nc,"rho_a")
sample.c <- ncvar_get(nc,"sample")
aird <- ncvar_get(nc,"air_density")
skt <- ncvar_get(nc,"surface_skin_temperature")
airt10 <- ncvar_get(nc,"air_temperature")
dewt <- ncvar_get(nc,"dew_point_temperature")
pblh <- ncvar_get(nc,"boundry_layer_height")
flags <-  ncvar_get(nc,"quality_flags")
nc_close(nc)

## unit same as buoy
skt <- convert_kelvin_to_celsius(skt)
dewt <- convert_kelvin_to_celsius(dewt)
airt10 <- convert_kelvin_to_celsius(airt10)

t.stt <- system(paste0("ncdump -h ",cyg.ff," |egrep 'sample_time:units'|grep -Eo '[[:digit:]]{4}-[[:digit:]]{2}-[[:digit:]]{2} [[:digit:]]{2}:[[:digit:]]{2}:[[:digit:]][0-9,.]+'  "),
                intern = TRUE)
time.utc.c <- as.POSIXct(origin=t.stt, st.c,tz="UTC")


#-----

cyg.data.frame <- data.frame(time=st.c, 
                  time.utc=time.utc.c, 
                  lon=lon.c, 
                  lat=lat.c, 
                  lhf=lhf.c, 
                  shf=shf.c,
                  # usr=usr.c,
                  solar=solar.c,
                  # rhoa=rho_a.c, 
                  skt=skt,
                  airt10=airt10,
                  dewt=dewt, 
                  aird=aird,
                  sample=sample.c,
                  pblh=pblh,
                  flags=flags
                  )

# note: t.stt, rho_a.c, and usr.c are not working
rm(st.c,t.stt,time.utc.c,lon.c, lat.c, pblh,lhf.c, shf.c, skt,airt10,dewt,solar.c,aird,sample.c,flags)

cyg.data.frame$lon <- lonc(cyg.data.frame$lon)

#. Check dimension
dim(cyg.data.frame)

# check variable data
head(cyg.data.frame)

#plot a variable histogram
hist(cyg.data.frame$pblh)


# ----------

install.packages("tmap", repos = c("https://r-tmap.r-universe.dev",
                                   "https://cloud.r-project.org"))

install.packages(c("cowplot", "googleway", "ggplot2", "ggrepel", "ggspatial", "libwgeom", "sf", "rnaturalearth", "rnaturalearthdata"))

library(ggplot2) # tidyverse data visualization package
library(tidyverse)
library(sf)
library(rnaturalearth)
library(rnaturalearthdata)


data <- "/Users/anniefeng/data/pblh_gps_2006-2019_2x2_season.nc"

nc <- nc_open(data)
lat.c <- ncvar_get(nc,"lat")
lon.c <- ncvar_get(nc,"lon")
season.c <- ncvar_get(nc, "season")
atm.c <- ncvar_get(nc, "atmosphere_boundary_layer_thickness")

nc_close(nc)

lon <- lonc(lon.c)
lat <- as.double(lat.c)

world <- ne_countries(scale = "medium", returnclass = "sf")
map <- ggplot(data = world) +
        geom_sf()
map

atm_plot <- map + 
  geom_point(data = abl_thickness,
             aes(long, lat, color = abl_thickness), size = 1.2,
             alpha = 0.5)

atm_plot

abl_thickness <- as.data.frame.array(atm.c[,,1])
dim(abl_thickness)

world_coordinates <- map_data("world")
ggplot() +
  geom_map(
    data = abl_thickness, map = world_coordinates, map_id = "region"
  )
