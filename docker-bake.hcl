variable "REGISTRY" {
  default = "registry.diginfra.net/tsd"
}

variable "IMAGE_NAME" {
  default = "hi-bataafse-politieke-tijdschriften-browser"
}

variable "TAG" {
  default = "latest"
}

function "image_ref" {
  params = [name]
  result = REGISTRY != "" ? "${REGISTRY}/${name}:${TAG}" : "${name}:${TAG}"
}

group "default" {
  targets = ["app"]
}

target "app" {
  context    = "."
  dockerfile = "Dockerfile"
  target     = "runtime"
  tags       = [image_ref(IMAGE_NAME)]
  platforms  = ["linux/amd64", "linux/arm64"]
}
